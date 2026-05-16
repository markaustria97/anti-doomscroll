import type { ChallengeCatalogTopic } from "./content";

export type LearnerLevel = "beginner" | "intermediate" | "advanced";
export type ChallengeKind = "logic" | "ui-react-tailwind";
export type ChallengeLanguage = "js" | "jsx" | "ts" | "tsx";
export type ChallengeProgression = "foundation" | "core" | "stretch";

export interface ChallengeAiUsage {
  inputTokens?: number;
  outputTokens?: number;
  totalTokens?: number;
  durationMs?: number;
  ttftMs?: number;
}

export type ChallengeSubtopic = Pick<
  ChallengeCatalogTopic,
  | "key"
  | "groupId"
  | "groupLabel"
  | "groupTitle"
  | "dayId"
  | "dayLabel"
  | "dayTitle"
  | "topicId"
  | "topicTitle"
  | "hasEmbeddedChallenge"
>;

export interface GeneratedChallenge {
  id: string;
  title: string;
  summary: string;
  learnerLevel: LearnerLevel;
  groupId?: string;
  groupLabel?: string;
  groupTitle?: string;
  progressionStep?: number;
  progressionLabel?: ChallengeProgression;
  challengeKind: ChallengeKind;
  language: ChallengeLanguage;
  instructionsMarkdown: string;
  starterCode: string;
  referenceSolution: string;
  previewCode: string | null;
  passCriteria: string[];
  reviewFocus: string[];
  estimatedMinutes: number;
  selectedSubtopics: ChallengeSubtopic[];
  generatedAt: string;
}

export interface ChallengeReviewResult {
  passed: boolean;
  summary: string;
  feedbackMarkdown: string;
  nextStep: string;
  bestPractices: string[];
  reviewedAt: string;
}

export interface ChallengeGenerationRequest {
  learnerLevel?: LearnerLevel;
  groupId?: string;
  topicKeys?: string[];
  createdChallengeRefs?: string[];
}

export interface ChallengeReviewRequest {
  learnerLevel?: LearnerLevel;
  attempt?: number;
  challenge?: GeneratedChallenge;
  userCode?: string;
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) && value.every((item) => typeof item === "string")
  );
}

export function isChallengeAiUsage(value: unknown): value is ChallengeAiUsage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ChallengeAiUsage>;

  return (
    (candidate.inputTokens === undefined ||
      typeof candidate.inputTokens === "number") &&
    (candidate.outputTokens === undefined ||
      typeof candidate.outputTokens === "number") &&
    (candidate.totalTokens === undefined ||
      typeof candidate.totalTokens === "number") &&
    (candidate.durationMs === undefined ||
      typeof candidate.durationMs === "number") &&
    (candidate.ttftMs === undefined || typeof candidate.ttftMs === "number")
  );
}

export function isValidLearnerLevel(
  value: string | undefined
): value is LearnerLevel {
  return (
    value === "beginner" || value === "intermediate" || value === "advanced"
  );
}

export function isValidChallengeKind(
  value: string | undefined
): value is ChallengeKind {
  return value === "logic" || value === "ui-react-tailwind";
}

export function isValidChallengeProgression(
  value: string | undefined
): value is ChallengeProgression {
  return value === "foundation" || value === "core" || value === "stretch";
}

export function isValidChallengeLanguage(
  value: string | undefined
): value is ChallengeLanguage {
  return value === "js" || value === "jsx" || value === "ts" || value === "tsx";
}

export function isChallengeSubtopic(
  value: unknown
): value is ChallengeSubtopic {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ChallengeSubtopic>;

  return (
    typeof candidate.key === "string" &&
    typeof candidate.groupId === "string" &&
    typeof candidate.groupLabel === "string" &&
    typeof candidate.groupTitle === "string" &&
    typeof candidate.dayId === "string" &&
    typeof candidate.dayLabel === "string" &&
    typeof candidate.dayTitle === "string" &&
    typeof candidate.topicId === "string" &&
    typeof candidate.topicTitle === "string" &&
    typeof candidate.hasEmbeddedChallenge === "boolean"
  );
}

export function isGeneratedChallenge(
  value: unknown
): value is GeneratedChallenge {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<GeneratedChallenge>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.title === "string" &&
    typeof candidate.summary === "string" &&
    isValidLearnerLevel(candidate.learnerLevel) &&
    (candidate.groupId === undefined ||
      typeof candidate.groupId === "string") &&
    (candidate.groupLabel === undefined ||
      typeof candidate.groupLabel === "string") &&
    (candidate.groupTitle === undefined ||
      typeof candidate.groupTitle === "string") &&
    (candidate.progressionStep === undefined ||
      typeof candidate.progressionStep === "number") &&
    (candidate.progressionLabel === undefined ||
      isValidChallengeProgression(candidate.progressionLabel)) &&
    isValidChallengeKind(candidate.challengeKind) &&
    isValidChallengeLanguage(candidate.language) &&
    typeof candidate.instructionsMarkdown === "string" &&
    typeof candidate.starterCode === "string" &&
    typeof candidate.referenceSolution === "string" &&
    (candidate.previewCode === null ||
      typeof candidate.previewCode === "string") &&
    isStringArray(candidate.passCriteria) &&
    isStringArray(candidate.reviewFocus) &&
    typeof candidate.estimatedMinutes === "number" &&
    Array.isArray(candidate.selectedSubtopics) &&
    candidate.selectedSubtopics.every(isChallengeSubtopic) &&
    typeof candidate.generatedAt === "string"
  );
}

export function isChallengeReviewResult(
  value: unknown
): value is ChallengeReviewResult {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<ChallengeReviewResult>;

  return (
    typeof candidate.passed === "boolean" &&
    typeof candidate.summary === "string" &&
    typeof candidate.feedbackMarkdown === "string" &&
    typeof candidate.nextStep === "string" &&
    isStringArray(candidate.bestPractices) &&
    typeof candidate.reviewedAt === "string"
  );
}

export function clampEstimatedMinutes(value: number): number {
  if (!Number.isFinite(value)) {
    return 25;
  }

  return Math.min(90, Math.max(10, Math.round(value)));
}

export function getProgressionForChallengeCount(count: number): {
  learnerLevel: LearnerLevel;
  progressionLabel: ChallengeProgression;
} {
  if (count < 2) {
    return {
      learnerLevel: "beginner",
      progressionLabel: "foundation",
    };
  }

  if (count < 5) {
    return {
      learnerLevel: "intermediate",
      progressionLabel: "core",
    };
  }

  return {
    learnerLevel: "advanced",
    progressionLabel: "stretch",
  };
}

export function createChallengeReference({
  title,
  summary,
}: Pick<GeneratedChallenge, "title" | "summary">): string {
  return [title.trim(), summary.trim()]
    .filter(Boolean)
    .join(" :: ")
    .slice(0, 240);
}
