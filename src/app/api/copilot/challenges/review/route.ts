import {
  isGeneratedChallenge,
  isValidLearnerLevel,
  type ChallengeReviewRequest,
  type ChallengeReviewResult,
} from "@/lib/challenge-lab";
import {
  DEFAULT_COPILOT_MODEL,
  OAUTH_TOKEN_COOKIE,
  runCopilotPrompt,
} from "@/lib/copilot";
import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const MAX_CODE_LENGTH = 20000;

function truncate(value: string | undefined): string {
  return (value || "").trim().slice(0, MAX_CODE_LENGTH);
}

function extractJsonPayload(value: string): unknown {
  const fencedMatch = /```json\s*([\s\S]*?)```/i.exec(value);
  const jsonText = fencedMatch?.[1]?.trim() || value.trim();
  const firstBrace = jsonText.indexOf("{");
  const lastBrace = jsonText.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error("Copilot did not return a valid JSON object.");
  }

  return JSON.parse(jsonText.slice(firstBrace, lastBrace + 1)) as unknown;
}

function buildReviewPrompt({
  learnerLevel,
  attempt,
  challenge,
  userCode,
}: {
  learnerLevel: NonNullable<ChallengeReviewRequest["learnerLevel"]>;
  attempt: number;
  challenge: NonNullable<ChallengeReviewRequest["challenge"]>;
  userCode: string;
}) {
  return [
    "Review this learner submission against the generated challenge.",
    "Return JSON only with no prose outside the object.",
    "Pass only when the essential requirements are satisfied.",
    "For UI challenges, allow stylistic differences but require the requested structure and behaviors.",
    "When the learner has not passed, explain the blockers first and then give the next smallest retry step.",
    "Do not paste the full reference solution.",
    "Use this JSON schema exactly:",
    '{"passed":true,"summary":"string","feedbackMarkdown":"string","nextStep":"string","bestPractices":["string"]}',
    `Learner level: ${learnerLevel}`,
    `Attempt number: ${attempt}`,
    `Challenge title: ${challenge.title}`,
    `Challenge kind: ${challenge.challengeKind}`,
    "Challenge instructions:",
    challenge.instructionsMarkdown,
    "Pass criteria:",
    challenge.passCriteria.map((item) => `- ${item}`).join("\n"),
    "Review focus:",
    challenge.reviewFocus.map((item) => `- ${item}`).join("\n"),
    "Reference solution:",
    challenge.referenceSolution,
    "Learner code:",
    userCode,
  ].join("\n\n");
}

function normalizeReviewResult(value: unknown): ChallengeReviewResult {
  if (!value || typeof value !== "object") {
    throw new Error("Copilot returned an invalid review payload.");
  }

  const candidate = value as Record<string, unknown>;
  const bestPractices = Array.isArray(candidate.bestPractices)
    ? candidate.bestPractices
        .filter((item): item is string => typeof item === "string")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  return {
    passed: Boolean(candidate.passed),
    summary:
      typeof candidate.summary === "string" && candidate.summary.trim()
        ? candidate.summary.trim()
        : "Review complete.",
    feedbackMarkdown:
      typeof candidate.feedbackMarkdown === "string" &&
      candidate.feedbackMarkdown.trim()
        ? candidate.feedbackMarkdown.trim()
        : "## Feedback\nCopilot could not produce detailed feedback for this attempt.",
    nextStep:
      typeof candidate.nextStep === "string" && candidate.nextStep.trim()
        ? candidate.nextStep.trim()
        : "Revise the solution and try again.",
    bestPractices,
    reviewedAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const githubToken = request.cookies.get(OAUTH_TOKEN_COOKIE)?.value?.trim();
    if (!githubToken) {
      return NextResponse.json(
        {
          error: "GitHub OAuth sign-in required before reviewing solutions.",
          authUrl: "/api/auth/github/login",
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as ChallengeReviewRequest;
    const learnerLevel = body.learnerLevel;
    const attempt = Number.isFinite(body.attempt)
      ? Math.max(1, body.attempt || 1)
      : 1;
    const userCode = truncate(body.userCode);

    if (!isValidLearnerLevel(learnerLevel)) {
      return NextResponse.json(
        { error: "Invalid review level." },
        { status: 400 }
      );
    }

    if (!isGeneratedChallenge(body.challenge)) {
      return NextResponse.json(
        { error: "Challenge context is invalid or missing." },
        { status: 400 }
      );
    }

    if (!userCode) {
      return NextResponse.json(
        { error: "Paste your code before asking Copilot to review it." },
        { status: 400 }
      );
    }

    const prompt = buildReviewPrompt({
      learnerLevel,
      attempt,
      challenge: body.challenge,
      userCode,
    });
    const rawResponse = await runCopilotPrompt({
      githubToken,
      prompt,
      systemMessage: [
        "You review learner coding challenge submissions.",
        "Return strict JSON only.",
        "Be decisive about pass versus retry.",
        "Correctness comes before style advice.",
      ].join("\n"),
    });
    const review = normalizeReviewResult(extractJsonPayload(rawResponse));

    return NextResponse.json({
      review,
      model: DEFAULT_COPILOT_MODEL,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Copilot challenge review failed.";
    const stack = error instanceof Error ? error.stack : undefined;

    console.error("[Copilot Challenge Review] Error caught:", message);
    if (stack) {
      console.error("[Copilot Challenge Review] Stack trace:", stack);
    }

    return NextResponse.json(
      {
        error:
          "Copilot challenge review is unavailable right now. Ensure GitHub Copilot authentication is available in this runtime. " +
          message,
      },
      { status: 500 }
    );
  }
}
