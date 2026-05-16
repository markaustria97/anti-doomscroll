import {
  isChallengeReviewResult,
  isGeneratedChallenge,
  type ChallengeGenerationRequest,
  type ChallengeReviewRequest,
  type ChallengeReviewResult,
  type GeneratedChallenge,
} from "./challenge-lab";

interface StreamEventBase {
  type: string;
}

interface StatusEvent extends StreamEventBase {
  type: "status";
  message: string;
}

interface DeltaEvent extends StreamEventBase {
  type: "delta";
  delta: string;
}

interface ErrorEvent extends StreamEventBase {
  type: "error";
  error: string;
  authUrl?: string;
}

interface GenerateCompleteEvent extends StreamEventBase {
  type: "complete";
  challenge: unknown;
  model?: string;
}

interface ReviewCompleteEvent extends StreamEventBase {
  type: "complete";
  review: unknown;
  model?: string;
}

type StreamRequestError = Error & { authUrl?: string };

function splitBufferedMessages(buffer: string) {
  const segments = buffer.split("\n");

  return {
    messages: segments.slice(0, -1),
    remainder: segments.at(-1) || "",
  };
}

function isStatusEvent(value: unknown): value is StatusEvent {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    (value as Partial<StatusEvent>).type === "status" &&
    typeof (value as Partial<StatusEvent>).message === "string"
  );
}

function isDeltaEvent(value: unknown): value is DeltaEvent {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    (value as Partial<DeltaEvent>).type === "delta" &&
    typeof (value as Partial<DeltaEvent>).delta === "string"
  );
}

function isErrorEvent(value: unknown): value is ErrorEvent {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    (value as Partial<ErrorEvent>).type === "error" &&
    typeof (value as Partial<ErrorEvent>).error === "string"
  );
}

function isGenerateCompleteEvent(
  value: unknown
): value is GenerateCompleteEvent {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    (value as Partial<GenerateCompleteEvent>).type === "complete" &&
    "challenge" in (value as GenerateCompleteEvent)
  );
}

function isReviewCompleteEvent(value: unknown): value is ReviewCompleteEvent {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    (value as Partial<ReviewCompleteEvent>).type === "complete" &&
    "review" in (value as ReviewCompleteEvent)
  );
}

function createStreamRequestError(
  message: string,
  authUrl?: string
): StreamRequestError {
  return Object.assign(new Error(message), authUrl ? { authUrl } : {});
}

export function getAuthUrlFromError(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return null;
  }

  const authUrl = (error as StreamRequestError).authUrl;
  return typeof authUrl === "string" ? authUrl : null;
}

async function consumeNdjsonStream({
  response,
  onEvent,
}: {
  response: Response;
  onEvent: (event: unknown) => void;
}) {
  if (!response.body) {
    throw new Error("Streaming response body was not available.");
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();

    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const { messages, remainder } = splitBufferedMessages(buffer);
    buffer = remainder;

    for (const message of messages) {
      if (!message.trim()) {
        continue;
      }

      onEvent(JSON.parse(message) as unknown);
    }
  }

  buffer += decoder.decode();

  if (buffer.trim()) {
    onEvent(JSON.parse(buffer) as unknown);
  }
}

async function toJsonError(response: Response): Promise<{
  error?: string;
  authUrl?: string;
}> {
  return (await response.json().catch(() => ({ error: undefined }))) as {
    error?: string;
    authUrl?: string;
  };
}

export async function readGeneratedChallengeStream({
  body,
  onStatus,
}: {
  body: ChallengeGenerationRequest;
  onStatus?: (message: string) => void;
}): Promise<{
  challenge: GeneratedChallenge;
  model: string | null;
}> {
  const response = await fetch("/api/copilot/challenges/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await toJsonError(response);
    throw createStreamRequestError(
      payload.error || "Challenge generation failed.",
      payload.authUrl
    );
  }

  let generatedChallenge: GeneratedChallenge | null = null;
  let model: string | null = null;

  await consumeNdjsonStream({
    response,
    onEvent(event) {
      if (isStatusEvent(event)) {
        onStatus?.(event.message);
        return;
      }

      if (isDeltaEvent(event)) {
        onStatus?.("Receiving challenge draft...");
        return;
      }

      if (isErrorEvent(event)) {
        throw createStreamRequestError(event.error, event.authUrl);
      }

      if (isGenerateCompleteEvent(event)) {
        if (!isGeneratedChallenge(event.challenge)) {
          throw new Error(
            "Challenge generation stream returned an invalid payload."
          );
        }

        generatedChallenge = event.challenge;
        model = typeof event.model === "string" ? event.model : null;
      }
    },
  });

  if (!generatedChallenge) {
    throw new Error(
      "Challenge generation ended before a challenge was returned."
    );
  }

  return {
    challenge: generatedChallenge,
    model,
  };
}

export async function readReviewStream({
  body,
  onStatus,
}: {
  body: ChallengeReviewRequest;
  onStatus?: (message: string) => void;
}): Promise<{
  review: ChallengeReviewResult;
  model: string | null;
}> {
  const response = await fetch("/api/copilot/challenges/review", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await toJsonError(response);
    throw createStreamRequestError(
      payload.error || "Challenge review failed.",
      payload.authUrl
    );
  }

  let reviewResult: ChallengeReviewResult | null = null;
  let model: string | null = null;

  await consumeNdjsonStream({
    response,
    onEvent(event) {
      if (isStatusEvent(event)) {
        onStatus?.(event.message);
        return;
      }

      if (isDeltaEvent(event)) {
        onStatus?.("Receiving review feedback...");
        return;
      }

      if (isErrorEvent(event)) {
        throw createStreamRequestError(event.error, event.authUrl);
      }

      if (isReviewCompleteEvent(event)) {
        if (!isChallengeReviewResult(event.review)) {
          throw new Error(
            "Challenge review stream returned an invalid payload."
          );
        }

        reviewResult = event.review;
        model = typeof event.model === "string" ? event.model : null;
      }
    },
  });

  if (!reviewResult) {
    throw new Error("Challenge review ended before a result was returned.");
  }

  return {
    review: reviewResult,
    model,
  };
}
