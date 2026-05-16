import {
  clampEstimatedMinutes,
  getProgressionForChallengeCount,
  isValidChallengeKind,
  isValidChallengeLanguage,
  isValidLearnerLevel,
  type ChallengeGenerationRequest,
  type ChallengeSubtopic,
  type GeneratedChallenge,
} from "@/lib/challenge-lab";
import {
  getChallengeCatalog,
  getChallengeTopicContexts,
  getGroup,
} from "@/lib/content";
import {
  DEFAULT_COPILOT_MODEL,
  OAUTH_TOKEN_COOKIE,
  runCopilotPrompt,
} from "@/lib/copilot";
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const MAX_TOPIC_COUNT = 3;
const MAX_LESSON_CONTEXT_CHARS = 900;
const MAX_CHALLENGE_CONTEXT_CHARS = 350;
const MAX_PREVIOUS_CHALLENGES = 12;
const GENERATION_TIMEOUT_MS = 90000;

function truncate(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
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

function toGenerateErrorMessage(message: string): string {
  if (/Timeout after \d+ms waiting for session\.idle/i.test(message)) {
    return "Copilot challenge generation timed out before the model finished. Retry once, or reduce the selected scope if it keeps happening.";
  }

  return (
    "Copilot challenge generation is unavailable right now. Ensure GitHub Copilot authentication is available in this runtime. " +
    message
  );
}

function isUiCapableTopic(value: string): boolean {
  return /(react|tailwind|next\.js|next js|base ui|component|tsx|jsx|ui)/i.test(
    value
  );
}

function toSelectedSubtopics(
  contexts: ReturnType<typeof getChallengeTopicContexts>
): ChallengeSubtopic[] {
  return contexts.map((context) => ({
    key: context.key,
    groupId: context.groupId,
    groupLabel: context.groupLabel,
    groupTitle: context.groupTitle,
    dayId: context.dayId,
    dayLabel: context.dayLabel,
    dayTitle: context.dayTitle,
    topicId: context.topicId,
    topicTitle: context.topicTitle,
    hasEmbeddedChallenge: context.hasEmbeddedChallenge,
  }));
}

function selectRepresentativeTopicKeys({
  groupId,
  challengeCount,
}: {
  groupId: string;
  challengeCount: number;
}): string[] {
  const groupCatalog = getChallengeCatalog([groupId]).sort((left, right) =>
    left.key.localeCompare(right.key)
  );

  if (groupCatalog.length <= MAX_TOPIC_COUNT) {
    return groupCatalog.map((topic) => topic.key);
  }

  const startIndex = (challengeCount * MAX_TOPIC_COUNT) % groupCatalog.length;

  return [
    ...groupCatalog.slice(startIndex),
    ...groupCatalog.slice(0, startIndex),
  ]
    .slice(0, MAX_TOPIC_COUNT)
    .map((topic) => topic.key);
}

function buildTopicContext({
  groupLabel,
  groupTitle,
  groupDescription,
  contexts,
}: {
  groupLabel: string;
  groupTitle: string;
  groupDescription: string;
  contexts: ReturnType<typeof getChallengeTopicContexts>;
}): string {
  return [
    `Group: ${groupLabel} — ${groupTitle}`,
    `Description: ${groupDescription}`,
    "Representative study context:",
    contexts
      .map((context, index) => {
        const embeddedChallenge = context.embeddedChallenge
          ? truncate(
              context.embeddedChallenge.challengeMarkdown,
              MAX_CHALLENGE_CONTEXT_CHARS
            )
          : "None";

        return [
          `Topic ${index + 1}`,
          `Day: ${context.dayLabel} — ${context.dayTitle}`,
          `Topic title: ${context.topicTitle}`,
          `Lesson excerpt: ${truncate(context.lessonContent, MAX_LESSON_CONTEXT_CHARS)}`,
          `Existing embedded challenge: ${embeddedChallenge}`,
        ].join("\n");
      })
      .join("\n\n"),
  ].join("\n\n");
}

function buildStarterCode(kind: GeneratedChallenge["challengeKind"]): string {
  if (kind === "ui-react-tailwind") {
    return [
      "export default function ChallengeSolution() {",
      "  return (",
      '    <div className="min-h-screen bg-neutral-950 px-6 py-10 text-white">',
      '      <div className="mx-auto max-w-3xl rounded-3xl border border-white/10 bg-neutral-900/80 p-6 shadow-2xl shadow-black/30">',
      "        {/* TODO: build the requested UI here */}",
      "      </div>",
      "    </div>",
      "  );",
      "}",
    ].join("\n");
  }

  return [
    "export function solveChallenge() {",
    '  throw new Error("TODO: implement the challenge solution.");',
    "}",
  ].join("\n");
}

function getStringValue(
  candidate: Record<string, unknown>,
  key: string
): string {
  const value = candidate[key];
  return typeof value === "string" ? value.trim() : "";
}

function getStringArrayValue(
  candidate: Record<string, unknown>,
  key: string
): string[] {
  const value = candidate[key];
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter((item): item is string => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean);
}

function resolveChallengeKind(
  candidate: Record<string, unknown>,
  uiPreferred: boolean
): GeneratedChallenge["challengeKind"] {
  const value = candidate.challengeKind;
  if (typeof value === "string" && isValidChallengeKind(value)) {
    return value;
  }

  return uiPreferred ? "ui-react-tailwind" : "logic";
}

function resolveChallengeLanguage(
  candidate: Record<string, unknown>,
  challengeKind: GeneratedChallenge["challengeKind"]
): GeneratedChallenge["language"] {
  const value = candidate.language;
  if (typeof value === "string" && isValidChallengeLanguage(value)) {
    return value;
  }

  return challengeKind === "ui-react-tailwind" ? "tsx" : "ts";
}

function resolvePreviewCode({
  candidate,
  challengeKind,
  referenceSolution,
}: {
  candidate: Record<string, unknown>;
  challengeKind: GeneratedChallenge["challengeKind"];
  referenceSolution: string;
}): string | null {
  if (challengeKind !== "ui-react-tailwind") {
    return null;
  }

  const previewCode = getStringValue(candidate, "previewCode");
  return previewCode || referenceSolution;
}

function defaultEstimatedMinutes(
  learnerLevel: NonNullable<ChallengeGenerationRequest["learnerLevel"]>
): number {
  if (learnerLevel === "beginner") {
    return 20;
  }

  if (learnerLevel === "intermediate") {
    return 30;
  }

  return 40;
}

function buildPrompt({
  learnerLevel,
  topicContext,
  uiPreferred,
  groupLabel,
  groupTitle,
  createdChallengeRefs,
  progressionLabel,
}: {
  learnerLevel: NonNullable<ChallengeGenerationRequest["learnerLevel"]>;
  topicContext: string;
  uiPreferred: boolean;
  groupLabel: string;
  groupTitle: string;
  createdChallengeRefs: string[];
  progressionLabel: ReturnType<
    typeof getProgressionForChallengeCount
  >["progressionLabel"];
}) {
  const progressionInstructions: Record<
    NonNullable<ChallengeGenerationRequest["learnerLevel"]>,
    string
  > = {
    beginner:
      "Start with a basic version of a common frontend interview problem. Keep the surface area small and the required behavior focused.",
    intermediate:
      "Move to a more complete interview challenge with a few meaningful behaviors, clearer state transitions, and at least one realistic edge case.",
    advanced:
      "Use a tougher interview variant that still fits in one file, but expect broader behavior, stronger edge-case handling, or cleaner abstractions.",
  };

  return [
    "Create one fresh frontend interview challenge for a study app.",
    "Return JSON only with no prose before or after the object.",
    `Scope the challenge to this study group: ${groupLabel} — ${groupTitle}.`,
    "The challenge should feel like a common frontend interview prompt rather than a niche course drill.",
    "Use the representative study context below as background. Do not force every background topic into the solution if it would make the challenge artificial.",
    progressionInstructions[learnerLevel],
    createdChallengeRefs.length > 0
      ? [
          "Do not repeat or lightly rename any of these previously generated challenges:",
          ...createdChallengeRefs.map((challengeRef) => `- ${challengeRef}`),
        ].join("\n")
      : "No previous challenges have been generated for this group yet.",
    "Do not ask for package installation, APIs, databases, images, file uploads, or multi-file setups.",
    uiPreferred
      ? [
          'Set "challengeKind" to "ui-react-tailwind" unless the selected topics make that impossible.',
          'For "ui-react-tailwind", set "language" to "tsx" and make both "starterCode" and "referenceSolution" a single-file React component with `export default function ChallengeSolution()`.',
          "For UI solutions, use Tailwind utility classes only and avoid external component libraries or icon packages.",
          'For UI challenges, set "previewCode" to a working TSX component that renders the expected finished UI.',
        ].join("\n")
      : [
          'Set "challengeKind" to "logic".',
          'For logic challenges, set "previewCode" to null and keep the task solvable in one file.',
        ].join("\n"),
    "Keep the instructions concrete and testable.",
    "Provide a correct reference solution.",
    "Make the starter code incomplete but runnable after basic edits.",
    "Use `passCriteria` as the challenge specs section: concise, verifiable implementation requirements.",
    "Use this JSON schema exactly:",
    '{"title":"string","summary":"string","challengeKind":"logic|ui-react-tailwind","language":"js|jsx|ts|tsx","instructionsMarkdown":"string","starterCode":"string","referenceSolution":"string","previewCode":"string|null","passCriteria":["string"],"reviewFocus":["string"],"estimatedMinutes":25}',
    `Automatic progression stage: ${progressionLabel}`,
    `Learner level: ${learnerLevel}`,
    "Group context:",
    topicContext,
  ].join("\n\n");
}

function normalizeGeneratedChallenge({
  value,
  learnerLevel,
  selectedSubtopics,
  uiPreferred,
  group,
  progressionStep,
  progressionLabel,
}: {
  value: unknown;
  learnerLevel: NonNullable<ChallengeGenerationRequest["learnerLevel"]>;
  selectedSubtopics: ChallengeSubtopic[];
  uiPreferred: boolean;
  group: {
    id: string;
    label: string;
    title: string;
  };
  progressionStep: number;
  progressionLabel: ReturnType<
    typeof getProgressionForChallengeCount
  >["progressionLabel"];
}): GeneratedChallenge {
  if (!value || typeof value !== "object") {
    throw new Error("Copilot returned an invalid challenge payload.");
  }

  const candidate = value as Record<string, unknown>;
  const candidateKind = resolveChallengeKind(candidate, uiPreferred);
  const candidateLanguage = resolveChallengeLanguage(candidate, candidateKind);
  const referenceSolution = getStringValue(candidate, "referenceSolution");

  if (!referenceSolution) {
    throw new Error("Copilot did not return a reference solution.");
  }

  const starterCode =
    getStringValue(candidate, "starterCode") || buildStarterCode(candidateKind);
  const previewCode = resolvePreviewCode({
    candidate,
    challengeKind: candidateKind,
    referenceSolution,
  });
  const passCriteria = getStringArrayValue(candidate, "passCriteria");
  const reviewFocus = getStringArrayValue(candidate, "reviewFocus");
  const estimatedMinutesValue = candidate.estimatedMinutes;
  const estimatedMinutes =
    typeof estimatedMinutesValue === "number"
      ? estimatedMinutesValue
      : defaultEstimatedMinutes(learnerLevel);
  const title = getStringValue(candidate, "title") || "Generated challenge";
  const summary =
    getStringValue(candidate, "summary") ||
    "A fresh challenge generated from your selected group.";
  const instructionsMarkdown =
    getStringValue(candidate, "instructionsMarkdown") ||
    "## Goal\nComplete the requested task for the selected study group.";

  return {
    id: randomUUID(),
    title,
    summary,
    learnerLevel,
    groupId: group.id,
    groupLabel: group.label,
    groupTitle: group.title,
    progressionStep,
    progressionLabel,
    challengeKind: candidateKind,
    language: candidateLanguage,
    instructionsMarkdown,
    starterCode,
    referenceSolution,
    previewCode,
    passCriteria:
      passCriteria.length > 0
        ? passCriteria
        : ["Meets the core requirements and handles the stated edge cases."],
    reviewFocus:
      reviewFocus.length > 0
        ? reviewFocus
        : ["Correctness", "Completeness", "Clarity"],
    estimatedMinutes: clampEstimatedMinutes(estimatedMinutes),
    selectedSubtopics,
    generatedAt: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const githubToken = request.cookies.get(OAUTH_TOKEN_COOKIE)?.value?.trim();
    if (!githubToken) {
      return NextResponse.json(
        {
          error: "GitHub OAuth sign-in required before generating challenges.",
          authUrl: "/api/auth/github/login",
        },
        { status: 401 }
      );
    }

    const body = (await request.json()) as ChallengeGenerationRequest;
    const learnerLevel = body.learnerLevel;
    const groupId = typeof body.groupId === "string" ? body.groupId.trim() : "";
    const createdChallengeRefs = Array.isArray(body.createdChallengeRefs)
      ? body.createdChallengeRefs
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean)
          .slice(0, MAX_PREVIOUS_CHALLENGES)
      : [];

    if (!isValidLearnerLevel(learnerLevel)) {
      return NextResponse.json(
        { error: "Invalid challenge level." },
        { status: 400 }
      );
    }

    if (!groupId) {
      return NextResponse.json(
        {
          error: "Choose one group before generating a challenge.",
        },
        { status: 400 }
      );
    }

    const group = getGroup(groupId);
    if (!group) {
      return NextResponse.json(
        { error: "The selected group could not be resolved." },
        { status: 400 }
      );
    }

    const progression = getProgressionForChallengeCount(
      createdChallengeRefs.length
    );
    const representativeTopicKeys = selectRepresentativeTopicKeys({
      groupId,
      challengeCount: createdChallengeRefs.length,
    });

    if (representativeTopicKeys.length === 0) {
      return NextResponse.json(
        {
          error: "The selected group does not have any challenge context yet.",
        },
        { status: 400 }
      );
    }

    const contexts = getChallengeTopicContexts(representativeTopicKeys);

    if (contexts.length !== representativeTopicKeys.length) {
      return NextResponse.json(
        { error: "The selected group context could not be resolved." },
        { status: 400 }
      );
    }

    const uiPreferred = contexts.some((context) =>
      isUiCapableTopic(
        `${context.groupTitle} ${context.topicTitle} ${context.lessonContent}`
      )
    );
    const prompt = buildPrompt({
      learnerLevel,
      topicContext: buildTopicContext({
        groupLabel: group.label,
        groupTitle: group.title,
        groupDescription: group.description,
        contexts,
      }),
      uiPreferred,
      groupLabel: group.label,
      groupTitle: group.title,
      createdChallengeRefs,
      progressionLabel: progression.progressionLabel,
    });
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        const sendEvent = (event: Record<string, unknown>) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        };

        sendEvent({
          type: "status",
          message: `Scoping challenge #${createdChallengeRefs.length + 1} for ${group.title}...`,
        });

        try {
          const rawResponse = await runCopilotPrompt({
            githubToken,
            prompt,
            timeoutMs: GENERATION_TIMEOUT_MS,
            systemMessage: [
              "You design coding challenges for a focused learning app.",
              "Return strict JSON only.",
              "Prefer common frontend interview prompts over niche exercises.",
              "Never ask the learner to install packages or create additional files.",
              "Reference solutions must be correct and concise.",
            ].join("\n"),
            onDelta(delta) {
              sendEvent({
                type: "delta",
                delta,
              });
            },
          });
          const challenge = normalizeGeneratedChallenge({
            value: extractJsonPayload(rawResponse),
            learnerLevel,
            selectedSubtopics: toSelectedSubtopics(contexts),
            uiPreferred,
            group,
            progressionStep: createdChallengeRefs.length + 1,
            progressionLabel: progression.progressionLabel,
          });

          sendEvent({
            type: "complete",
            challenge,
            model: DEFAULT_COPILOT_MODEL,
          });
        } catch (error) {
          const message =
            error instanceof Error
              ? error.message
              : "Copilot challenge generation failed.";
          const stack = error instanceof Error ? error.stack : undefined;

          console.error("[Copilot Challenge Generate] Error caught:", message);
          if (stack) {
            console.error("[Copilot Challenge Generate] Stack trace:", stack);
          }

          sendEvent({
            type: "error",
            error: toGenerateErrorMessage(message),
          });
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Copilot challenge generation failed.";
    const stack = error instanceof Error ? error.stack : undefined;

    console.error("[Copilot Challenge Generate] Error caught:", message);
    if (stack) {
      console.error("[Copilot Challenge Generate] Stack trace:", stack);
    }

    return NextResponse.json(
      {
        error: toGenerateErrorMessage(message),
      },
      { status: 500 }
    );
  }
}
