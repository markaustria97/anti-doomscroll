"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { ChallengeCatalogTopic } from "@/lib/content";
import {
  isChallengeReviewResult,
  isGeneratedChallenge,
  isValidLearnerLevel,
  type ChallengeReviewResult,
  type GeneratedChallenge,
  type LearnerLevel,
} from "@/lib/challenge-lab";
import { MarkdownRenderer } from "./MarkdownRenderer";
import { ChallengePreview } from "./ChallengePreview";

const STORAGE_KEYS = {
  groupIds: "challenge-lab:selected-groups",
  history: "challenge-lab:history",
  learnerLevel: "challenge-lab:learner-level",
  session: "challenge-lab:session",
} as const;

const DEFAULT_LEVEL: LearnerLevel = "intermediate";

type GroupSummary = {
  id: string;
  label: string;
  title: string;
  description: string;
  dayCount: number;
  topicCount: number;
};

type ChallengeLabProps = Readonly<{
  groups: GroupSummary[];
  catalog: ChallengeCatalogTopic[];
  initialSelectedGroupIds: string[];
}>;

type ChallengeHistory = Record<
  string,
  {
    count: number;
    lastGeneratedAt: string;
    lastPassedAt?: string;
  }
>;

type PersistedSession = {
  challenge: GeneratedChallenge;
  userCode: string;
  review: ChallengeReviewResult | null;
  attemptCount: number;
  copilotModel: string | null;
};

const learnerLevelCopy: Record<
  LearnerLevel,
  { label: string; description: string }
> = {
  beginner: {
    label: "Beginner",
    description: "One subtopic, smaller scope, and more explicit requirements.",
  },
  intermediate: {
    label: "Intermediate",
    description: "Blend two subtopics and expect cleaner code and edge-case handling.",
  },
  advanced: {
    label: "Advanced",
    description: "Blend three subtopics and hold the solution to a stricter standard.",
  },
};

function isChallengeHistory(value: unknown): value is ChallengeHistory {
  if (!value || typeof value !== "object") {
    return false;
  }

  return Object.values(value as Record<string, unknown>).every((entry) => {
    if (!entry || typeof entry !== "object") {
      return false;
    }

    const candidate = entry as Partial<ChallengeHistory[string]>;
    return (
      typeof candidate.count === "number" &&
      typeof candidate.lastGeneratedAt === "string" &&
      (candidate.lastPassedAt === undefined || typeof candidate.lastPassedAt === "string")
    );
  });
}

function isPersistedSession(value: unknown): value is PersistedSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<PersistedSession>;

  return (
    isGeneratedChallenge(candidate.challenge) &&
    typeof candidate.userCode === "string" &&
    (candidate.review === null || candidate.review === undefined || isChallengeReviewResult(candidate.review)) &&
    typeof candidate.attemptCount === "number" &&
    (candidate.copilotModel === null ||
      candidate.copilotModel === undefined ||
      typeof candidate.copilotModel === "string")
  );
}

function getTopicCountForLevel(learnerLevel: LearnerLevel): number {
  if (learnerLevel === "beginner") {
    return 1;
  }

  if (learnerLevel === "advanced") {
    return 3;
  }

  return 2;
}

function shuffleTopics<T>(items: T[]): T[] {
  const nextItems = [...items];

  for (let index = nextItems.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [nextItems[index], nextItems[swapIndex]] = [
      nextItems[swapIndex],
      nextItems[index],
    ];
  }

  return nextItems;
}

function pickChallengeTopics({
  catalog,
  history,
  learnerLevel,
}: {
  catalog: ChallengeCatalogTopic[];
  history: ChallengeHistory;
  learnerLevel: LearnerLevel;
}): ChallengeCatalogTopic[] {
  const desiredCount = Math.min(getTopicCountForLevel(learnerLevel), catalog.length);

  if (desiredCount === 0) {
    return [];
  }

  const untouched = shuffleTopics(
    catalog.filter((topic) => (history[topic.key]?.count || 0) <= 0)
  );
  const revisits = shuffleTopics(
    catalog.filter((topic) => history[topic.key]?.count > 0)
  ).sort((left, right) => {
    const leftCount = history[left.key]?.count || 0;
    const rightCount = history[right.key]?.count || 0;
    return leftCount - rightCount;
  });

  return [...untouched, ...revisits].slice(0, desiredCount);
}

function updateGeneratedHistory({
  history,
  challenge,
}: {
  history: ChallengeHistory;
  challenge: GeneratedChallenge;
}): ChallengeHistory {
  const nextHistory = { ...history };

  for (const subtopic of challenge.selectedSubtopics) {
    const currentEntry = nextHistory[subtopic.key];
    nextHistory[subtopic.key] = {
      count: (currentEntry?.count || 0) + 1,
      lastGeneratedAt: challenge.generatedAt,
      lastPassedAt: currentEntry?.lastPassedAt,
    };
  }

  return nextHistory;
}

function updatePassedHistory({
  history,
  challenge,
  reviewedAt,
}: {
  history: ChallengeHistory;
  challenge: GeneratedChallenge;
  reviewedAt: string;
}): ChallengeHistory {
  const nextHistory = { ...history };

  for (const subtopic of challenge.selectedSubtopics) {
    const currentEntry = nextHistory[subtopic.key];
    if (!currentEntry) {
      continue;
    }

    nextHistory[subtopic.key] = {
      ...currentEntry,
      lastPassedAt: reviewedAt,
    };
  }

  return nextHistory;
}

function buildCodeBlock(code: string, language: string): string {
  return `\`\`\`${language}\n${code}\n\`\`\``;
}

function toAuthErrorMessage(payload: { error?: string; authUrl?: string }) {
  return payload.error || "Copilot is unavailable right now.";
}

function readStoredGroupIds(allowedGroupIds: Set<string>): string[] | null {
  const savedGroupIds = localStorage.getItem(STORAGE_KEYS.groupIds);
  if (!savedGroupIds) {
    return null;
  }

  try {
    const parsedGroupIds = JSON.parse(savedGroupIds) as unknown;
    if (!Array.isArray(parsedGroupIds)) {
      return null;
    }

    return parsedGroupIds.filter(
      (value): value is string =>
        typeof value === "string" && allowedGroupIds.has(value)
    );
  } catch {
    localStorage.removeItem(STORAGE_KEYS.groupIds);
    return null;
  }
}

function readStoredLearnerLevel(): LearnerLevel | null {
  const savedLearnerLevel = localStorage.getItem(STORAGE_KEYS.learnerLevel);
  if (!isValidLearnerLevel(savedLearnerLevel || undefined)) {
    return null;
  }

  return savedLearnerLevel as LearnerLevel;
}

function readStoredHistory(): ChallengeHistory | null {
  const savedHistory = localStorage.getItem(STORAGE_KEYS.history);
  if (!savedHistory) {
    return null;
  }

  try {
    const parsedHistory = JSON.parse(savedHistory) as unknown;
    if (!isChallengeHistory(parsedHistory)) {
      return null;
    }

    return parsedHistory;
  } catch {
    localStorage.removeItem(STORAGE_KEYS.history);
    return null;
  }
}

function readStoredSession(): PersistedSession | null {
  const savedSession = localStorage.getItem(STORAGE_KEYS.session);
  if (!savedSession) {
    return null;
  }

  try {
    const parsedSession = JSON.parse(savedSession) as unknown;
    if (!isPersistedSession(parsedSession)) {
      return null;
    }

    return parsedSession;
  } catch {
    localStorage.removeItem(STORAGE_KEYS.session);
    return null;
  }
}

type ScopeSidebarProps = Readonly<{
  groups: GroupSummary[];
  selectedGroupIds: string[];
  learnerLevel: LearnerLevel;
  nextTopicCount: number;
  totalCoveredSubtopics: number;
  untouchedInScope: number;
  filteredTopicCount: number;
  isGenerating: boolean;
  onLearnerLevelChange: (learnerLevel: LearnerLevel) => void;
  onToggleGroup: (groupId: string) => void;
  onGenerateChallenge: () => void;
}>;

function ScopeSidebar({
  groups,
  selectedGroupIds,
  learnerLevel,
  nextTopicCount,
  totalCoveredSubtopics,
  untouchedInScope,
  filteredTopicCount,
  isGenerating,
  onLearnerLevelChange,
  onToggleGroup,
  onGenerateChallenge,
}: ScopeSidebarProps) {
  return (
    <aside className="space-y-6">
      <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-(--accent)">
              Challenge Scope
            </p>
            <h2 className="mt-2 text-xl font-semibold text-white">
              Build the next set
            </h2>
          </div>
          <span className="rounded-full border border-(--border) px-3 py-1 text-xs text-(--text-muted)">
            {nextTopicCount} subtopic{nextTopicCount === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {(Object.entries(learnerLevelCopy) as Array<
            [LearnerLevel, (typeof learnerLevelCopy)[LearnerLevel]]
          >).map(([value, copy]) => {
            const isActive = learnerLevel === value;

            return (
              <button
                key={value}
                type="button"
                onClick={() => onLearnerLevelChange(value)}
                className={`w-full rounded-2xl border px-4 py-4 text-left transition-colors ${
                  isActive
                    ? "border-(--accent-dim) bg-(--accent-dim)/10"
                    : "border-(--border) hover:border-(--accent-dim)"
                }`}
              >
                <div className="text-sm font-semibold text-white">{copy.label}</div>
                <div className="mt-2 text-sm leading-6 text-(--text-muted)">
                  {copy.description}
                </div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onGenerateChallenge}
          disabled={isGenerating}
          className="mt-5 w-full rounded-xl bg-(--accent-dim) px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? "Generating challenge..." : "Generate challenge"}
        </button>
      </section>

      <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
        <p className="text-xs font-mono uppercase tracking-[0.18em] text-(--accent)">
          Tech Groups
        </p>
        <h2 className="mt-2 text-xl font-semibold text-white">Filter subtopics</h2>
        <p className="mt-2 text-sm leading-6 text-(--text-muted)">
          Leave everything unselected to let the generator pull from the full
          catalog.
        </p>

        <div className="mt-5 flex flex-wrap gap-3">
          {groups.map((group) => {
            const isActive = selectedGroupIds.includes(group.id);

            return (
              <button
                key={group.id}
                type="button"
                onClick={() => onToggleGroup(group.id)}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "border-(--accent-dim) bg-(--accent-dim)/10 text-white"
                    : "border-(--border) text-(--text-muted) hover:border-(--accent-dim) hover:text-white"
                }`}
              >
                {group.label}
              </button>
            );
          })}
        </div>

        <div className="mt-5 space-y-3">
          {groups.map((group) => (
            <div
              key={group.id}
              className="rounded-2xl border border-(--border) bg-black/20 p-4"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-semibold text-white">{group.title}</div>
                  <div className="mt-1 text-sm leading-6 text-(--text-muted)">
                    {group.description}
                  </div>
                </div>
                <span className="shrink-0 text-xs text-(--text-muted)">
                  {group.topicCount} topics
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
        <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-(--accent)">
            Covered
          </p>
          <div className="mt-3 text-3xl font-semibold text-white">
            {totalCoveredSubtopics}
          </div>
          <p className="mt-2 text-sm leading-6 text-(--text-muted)">
            Subtopics that have already appeared in generated challenges.
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-(--accent)">
            Untouched
          </p>
          <div className="mt-3 text-3xl font-semibold text-white">
            {untouchedInScope}
          </div>
          <p className="mt-2 text-sm leading-6 text-(--text-muted)">
            Subtopics in the current filter that have not been used yet.
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--bg-card) p-5">
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-(--accent)">
            In Scope
          </p>
          <div className="mt-3 text-3xl font-semibold text-white">
            {filteredTopicCount}
          </div>
          <p className="mt-2 text-sm leading-6 text-(--text-muted)">
            Available subtopics after applying the current filters.
          </p>
        </div>
      </section>
    </aside>
  );
}

type ChallengeSummaryCardProps = Readonly<{
  challenge: GeneratedChallenge;
  userCode: string;
}>;

function ChallengeSummaryCard({
  challenge,
  userCode,
}: ChallengeSummaryCardProps) {
  const isUiChallenge = challenge.challengeKind === "ui-react-tailwind";
  const challengeKindLabel = isUiChallenge
    ? "React + Tailwind"
    : "Logic challenge";

  return (
    <>
      <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-6 sm:p-7">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-(--accent)">
              Active Challenge
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-white sm:text-3xl">
              {challenge.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-(--text-muted)">
              {challenge.summary}
            </p>
          </div>

          <div className="rounded-2xl border border-(--border) bg-black/20 px-4 py-3 text-right text-sm text-(--text-muted)">
            <div>{challenge.estimatedMinutes} min target</div>
            <div className="mt-1 text-xs uppercase tracking-[0.16em] text-(--accent)">
              {challengeKindLabel}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          {challenge.selectedSubtopics.map((subtopic) => (
            <span
              key={subtopic.key}
              className="rounded-full border border-(--border) bg-black/20 px-4 py-2 text-xs text-(--text-muted)"
            >
              {subtopic.groupLabel} • {subtopic.topicTitle}
            </span>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <section className="rounded-2xl border border-(--border) bg-black/20 p-5">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-(--accent)">
              Challenge brief
            </p>
            <div className="markdown-body mt-4">
              <MarkdownRenderer content={challenge.instructionsMarkdown} />
            </div>
          </section>

          <section className="rounded-2xl border border-(--border) bg-black/20 p-5">
            <p className="text-xs font-mono uppercase tracking-[0.18em] text-(--accent)">
              Pass criteria
            </p>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-(--text-muted)">
              {challenge.passCriteria.map((criterion) => (
                <li key={criterion} className="rounded-xl border border-(--border) px-4 py-3">
                  {criterion}
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>

      {isUiChallenge ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <ChallengePreview
            title="Target Preview"
            subtitle="This renders the generated reference output so the UI target is visible without revealing the code immediately."
            source={challenge.previewCode || challenge.referenceSolution}
            language={challenge.language}
            emptyMessage="The generated challenge did not include a previewable UI target."
          />
          <ChallengePreview
            title="Your Preview"
            subtitle="This recompiles your current solution live. Keep the default export in place so the preview can mount."
            source={userCode}
            language={challenge.language}
            emptyMessage="Start editing the solution to see your version render here."
          />
        </div>
      ) : null}
    </>
  );
}

type ChallengeEditorCardProps = Readonly<{
  challenge: GeneratedChallenge;
  userCode: string;
  attemptCount: number;
  reviewStatusLabel: string;
  isGenerating: boolean;
  isReviewing: boolean;
  onUserCodeChange: (value: string) => void;
  onReview: () => void;
  onGenerateAnother: () => void;
}>;

function ChallengeEditorCard({
  challenge,
  userCode,
  attemptCount,
  reviewStatusLabel,
  isGenerating,
  isReviewing,
  onUserCodeChange,
  onReview,
  onGenerateAnother,
}: ChallengeEditorCardProps) {
  return (
    <section className="rounded-2xl border border-(--border) bg-(--bg-card) p-6 sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em] text-(--accent)">
            Solution editor
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            Write your answer
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-(--text-muted)">
            Copilot reviews the current code against the generated instructions,
            reference solution, and pass criteria. If it does not pass, keep
            iterating and retry.
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-black/20 px-4 py-3 text-sm text-(--text-muted)">
          <div>Attempt {attemptCount + (isReviewing ? 1 : 0)}</div>
          <div className="mt-1 text-xs uppercase tracking-[0.16em] text-(--accent)">
            {reviewStatusLabel}
          </div>
        </div>
      </div>

      <label className="mt-6 block text-sm font-medium text-white" htmlFor="challenge-lab-editor">
        Your code
      </label>
      <textarea
        id="challenge-lab-editor"
        value={userCode}
        onChange={(event) => onUserCodeChange(event.target.value)}
        spellCheck={false}
        placeholder="Write your solution here..."
        className="mt-3 min-h-96 w-full rounded-2xl border border-(--border) bg-black/30 px-4 py-4 font-mono text-sm leading-7 text-(--text) outline-none transition-colors placeholder:text-(--text-muted) focus:border-(--accent-dim)"
      />

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onReview}
          disabled={isReviewing || isGenerating}
          className="rounded-xl bg-(--accent-dim) px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isReviewing ? "Reviewing..." : "Check my solution"}
        </button>
        <button
          type="button"
          onClick={onGenerateAnother}
          disabled={isGenerating}
          className="rounded-xl border border-(--border) px-5 py-3 text-sm font-semibold text-(--text) transition-colors hover:border-(--accent-dim) hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? "Generating..." : "Generate another challenge"}
        </button>
      </div>

      <details className="mt-5 rounded-2xl border border-(--border) bg-black/20 p-4">
        <summary className="cursor-pointer select-none text-sm font-medium text-(--text-muted)">
          Reveal reference solution
        </summary>
        <div className="markdown-body mt-4 max-h-96 overflow-auto">
          <MarkdownRenderer
            content={buildCodeBlock(challenge.referenceSolution, challenge.language)}
          />
        </div>
      </details>
    </section>
  );
}

function ChallengeNoticeStack({
  error,
  authUrl,
}: Readonly<{
  error: string | null;
  authUrl: string | null;
}>) {
  if (!error && !authUrl) {
    return null;
  }

  return (
    <>
      {error ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {authUrl ? (
        <a
          href={authUrl}
          className="inline-flex rounded-xl border border-(--accent-dim) px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-(--accent-dim)/20"
        >
          Connect GitHub to use Copilot
        </a>
      ) : null}
    </>
  );
}

function ChallengeReviewCard({
  review,
}: Readonly<{ review: ChallengeReviewResult }>) {
  const reviewToneClass = review.passed
    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"
    : "border-amber-500/30 bg-amber-500/10 text-amber-100";

  return (
    <section className={`rounded-2xl border px-6 py-5 ${reviewToneClass}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-mono uppercase tracking-[0.18em]">
            Copilot review
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {review.summary}
          </h2>
        </div>
        <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/80">
          {new Date(review.reviewedAt).toLocaleString()}
        </span>
      </div>

      <div className="markdown-body mt-5 text-white/90">
        <MarkdownRenderer content={review.feedbackMarkdown} />
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <div className="text-xs font-mono uppercase tracking-[0.18em] text-white/70">
          Next step
        </div>
        <div className="mt-2 text-sm leading-7 text-white/90">{review.nextStep}</div>
      </div>

      {review.bestPractices.length > 0 ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {review.bestPractices.map((practice) => (
            <div
              key={practice}
              className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-6 text-white/85"
            >
              {practice}
            </div>
          ))}
        </div>
      ) : null}
    </section>
  );
}

function EmptyChallengeState({
  error,
  authUrl,
  isGenerating,
  onGenerateChallenge,
}: Readonly<{
  error: string | null;
  authUrl: string | null;
  isGenerating: boolean;
  onGenerateChallenge: () => void;
}>) {
  return (
    <section className="rounded-2xl border border-dashed border-(--border) bg-(--bg-card) p-10 text-center">
      <p className="text-xs font-mono uppercase tracking-[0.18em] text-(--accent)">
        No active challenge
      </p>
      <h2 className="mt-3 text-3xl font-semibold text-white">
        Generate a challenge set to start
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-(--text-muted) sm:text-base">
        The generator picks subtopics from the current filter, favors the ones
        that have not been used yet, and still falls back to prior topics when
        it needs to fill the set.
      </p>

      {error ? (
        <div className="mx-auto mt-6 max-w-2xl rounded-2xl border border-red-500/30 bg-red-500/10 px-5 py-4 text-left text-sm text-red-100">
          {error}
        </div>
      ) : null}

      {authUrl ? (
        <a
          href={authUrl}
          className="mt-6 inline-flex rounded-xl border border-(--accent-dim) px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-(--accent-dim)/20"
        >
          Connect GitHub to use Copilot
        </a>
      ) : null}

      <button
        type="button"
        onClick={onGenerateChallenge}
        disabled={isGenerating}
        className="mt-8 rounded-xl bg-(--accent-dim) px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isGenerating ? "Generating challenge..." : "Generate challenge"}
      </button>
    </section>
  );
}

export function ChallengeLab({
  groups,
  catalog,
  initialSelectedGroupIds,
}: ChallengeLabProps) {
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(
    initialSelectedGroupIds
  );
  const [learnerLevel, setLearnerLevel] = useState<LearnerLevel>(DEFAULT_LEVEL);
  const [history, setHistory] = useState<ChallengeHistory>({});
  const [currentChallenge, setCurrentChallenge] =
    useState<GeneratedChallenge | null>(null);
  const [userCode, setUserCode] = useState("");
  const [review, setReview] = useState<ChallengeReviewResult | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [copilotModel, setCopilotModel] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isReviewing, setIsReviewing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const allowedGroupIds = new Set(groups.map((group) => group.id));

    if (initialSelectedGroupIds.length === 0) {
      const storedGroupIds = readStoredGroupIds(allowedGroupIds);
      if (storedGroupIds) {
        setSelectedGroupIds(storedGroupIds);
      }
    }

    const storedLearnerLevel = readStoredLearnerLevel();
    if (storedLearnerLevel) {
      setLearnerLevel(storedLearnerLevel);
    }

    const storedHistory = readStoredHistory();
    if (storedHistory) {
      setHistory(storedHistory);
    }

    const storedSession = readStoredSession();
    if (storedSession) {
      setCurrentChallenge(storedSession.challenge);
      setUserCode(storedSession.userCode);
      setReview(storedSession.review ?? null);
      setAttemptCount(storedSession.attemptCount);
      setCopilotModel(storedSession.copilotModel ?? null);
    }

    setIsHydrated(true);
  }, [groups, initialSelectedGroupIds]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    localStorage.setItem(STORAGE_KEYS.groupIds, JSON.stringify(selectedGroupIds));
  }, [isHydrated, selectedGroupIds]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    localStorage.setItem(STORAGE_KEYS.learnerLevel, learnerLevel);
  }, [isHydrated, learnerLevel]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history));
  }, [history, isHydrated]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!currentChallenge) {
      localStorage.removeItem(STORAGE_KEYS.session);
      return;
    }

    const session: PersistedSession = {
      challenge: currentChallenge,
      userCode,
      review,
      attemptCount,
      copilotModel,
    };

    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  }, [attemptCount, copilotModel, currentChallenge, isHydrated, review, userCode]);

  const filteredCatalog = useMemo(() => {
    if (selectedGroupIds.length === 0) {
      return catalog;
    }

    const selectedGroups = new Set(selectedGroupIds);
    return catalog.filter((topic) => selectedGroups.has(topic.groupId));
  }, [catalog, selectedGroupIds]);

  const totalCoveredSubtopics = useMemo(
    () => catalog.filter((topic) => history[topic.key]?.count > 0).length,
    [catalog, history]
  );

  const untouchedInScope = useMemo(
    () => filteredCatalog.filter((topic) => (history[topic.key]?.count || 0) <= 0).length,
    [filteredCatalog, history]
  );

  const nextTopicCount = Math.min(
    getTopicCountForLevel(learnerLevel),
    filteredCatalog.length
  );
  let reviewStatusLabel = "Awaiting review";
  if (review) {
    reviewStatusLabel = review.passed ? "Passed" : "Retry open";
  }

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds((currentGroupIds) => {
      if (currentGroupIds.includes(groupId)) {
        return currentGroupIds.filter((value) => value !== groupId);
      }

      return [...currentGroupIds, groupId];
    });
  };

  const resetFeedback = () => {
    setError(null);
    setAuthUrl(null);
  };

  const generateChallenge = async () => {
    resetFeedback();

    if (filteredCatalog.length === 0) {
      setError("No subtopics match the current group filter.");
      return;
    }

    const selectedTopics = pickChallengeTopics({
      catalog: filteredCatalog,
      history,
      learnerLevel,
    });

    if (selectedTopics.length === 0) {
      setError("Could not find a valid set of subtopics for a new challenge.");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/copilot/challenges/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          learnerLevel,
          topicKeys: selectedTopics.map((topic) => topic.key),
        }),
      });

      const payload = (await response.json().catch(() => ({ error: undefined }))) as {
        challenge?: unknown;
        model?: string;
        error?: string;
        authUrl?: string;
      };
      const generatedChallenge = payload.challenge;

      if (!response.ok || !isGeneratedChallenge(generatedChallenge)) {
        setAuthUrl(payload.authUrl || null);
        setError(toAuthErrorMessage(payload));
        return;
      }

      setCurrentChallenge(generatedChallenge);
      setUserCode(generatedChallenge.starterCode);
      setReview(null);
      setAttemptCount(0);
      setCopilotModel(typeof payload.model === "string" ? payload.model : null);
      setHistory((currentHistory) =>
        updateGeneratedHistory({
          history: currentHistory,
          challenge: generatedChallenge,
        })
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Challenge generation failed."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const reviewSolution = async () => {
    resetFeedback();

    if (!currentChallenge) {
      setError("Generate a challenge first.");
      return;
    }

    if (!userCode.trim()) {
      setError("Write or paste a solution before asking Copilot to review it.");
      return;
    }

    const nextAttempt = attemptCount + 1;
    setIsReviewing(true);

    try {
      const response = await fetch("/api/copilot/challenges/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          learnerLevel,
          attempt: nextAttempt,
          challenge: currentChallenge,
          userCode,
        }),
      });

      const payload = (await response.json().catch(() => ({ error: undefined }))) as {
        review?: unknown;
        model?: string;
        error?: string;
        authUrl?: string;
      };
      const reviewResult = payload.review;

      if (!response.ok || !isChallengeReviewResult(reviewResult)) {
        setAuthUrl(payload.authUrl || null);
        setError(toAuthErrorMessage(payload));
        return;
      }

      setAttemptCount(nextAttempt);
      setReview(reviewResult);
      setCopilotModel(typeof payload.model === "string" ? payload.model : copilotModel);

      if (reviewResult.passed) {
        setHistory((currentHistory) =>
          updatePassedHistory({
            history: currentHistory,
            challenge: currentChallenge,
            reviewedAt: reviewResult.reviewedAt,
          })
        );
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Challenge review failed."
      );
    } finally {
      setIsReviewing(false);
    }
  };

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 sm:px-12">
      <header className="mb-10 flex flex-wrap items-end justify-between gap-6">
        <div>
          <Link
            href="/"
            className="inline-flex items-center text-sm text-(--accent) transition-opacity hover:opacity-80"
          >
            TECH GROUPS
          </Link>
          <h1 className="mt-4 text-4xl font-bold sm:text-5xl">Challenge Lab</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-(--text-muted) sm:text-base">
            Generate a fresh Copilot-backed challenge from your study subtopics,
            solve it in-browser, preview UI work live when it is a React and
            Tailwind task, and keep retrying until the review passes.
          </p>
        </div>

        <div className="rounded-2xl border border-(--border) bg-(--bg-card) px-4 py-3 text-sm text-(--text-muted)">
          <div>Coverage is stored locally in this browser.</div>
          <div className="mt-1 text-xs uppercase tracking-[0.16em] text-(--accent)">
            Model: {copilotModel || "gpt-5-mini"}
          </div>
        </div>
      </header>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <ScopeSidebar
          groups={groups}
          selectedGroupIds={selectedGroupIds}
          learnerLevel={learnerLevel}
          nextTopicCount={nextTopicCount}
          totalCoveredSubtopics={totalCoveredSubtopics}
          untouchedInScope={untouchedInScope}
          filteredTopicCount={filteredCatalog.length}
          isGenerating={isGenerating}
          onLearnerLevelChange={setLearnerLevel}
          onToggleGroup={toggleGroup}
          onGenerateChallenge={() => void generateChallenge()}
        />

        <div className="space-y-6">
          {currentChallenge ? (
            <>
              <ChallengeSummaryCard challenge={currentChallenge} userCode={userCode} />
              <ChallengeEditorCard
                challenge={currentChallenge}
                userCode={userCode}
                attemptCount={attemptCount}
                reviewStatusLabel={reviewStatusLabel}
                isGenerating={isGenerating}
                isReviewing={isReviewing}
                onUserCodeChange={setUserCode}
                onReview={() => void reviewSolution()}
                onGenerateAnother={() => void generateChallenge()}
              />
              <ChallengeNoticeStack error={error} authUrl={authUrl} />
              {review ? <ChallengeReviewCard review={review} /> : null}
            </>
          ) : (
            <EmptyChallengeState
              error={error}
              authUrl={authUrl}
              isGenerating={isGenerating}
              onGenerateChallenge={() => void generateChallenge()}
            />
          )}
        </div>
      </div>
    </main>
  );
}