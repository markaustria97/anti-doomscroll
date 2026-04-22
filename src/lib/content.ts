import fs from "node:fs";
import path from "node:path";

const CONTENT_DIR = path.join(process.cwd(), "javascript-typescript-mentor");

export interface Topic {
  id: string;
  title: string;
  content: string;
  lessonContent: string;
  filename: string;
  challenge: TopicChallenge | null;
}

export interface TopicChallenge {
  heading: string;
  challengeMarkdown: string;
  solutionMarkdown: string;
}

interface ParsedTopicSections {
  lessonContent: string;
  challenge: TopicChallenge | null;
}

export interface Day {
  id: string;
  label: string;
  title: string;
  topics: Topic[];
}

function extractTitle(content: string): string {
  const match = /^#\s+(.+)/m.exec(content);
  return match ? match[1].trim() : "Untitled";
}

function parseDayTitle(dayId: string, indexContent: string | null): string {
  const parsedDayId = Number.parseInt(dayId, 10);

  if (indexContent) {
    const regex = new RegExp(
      String.raw`Day\s+${parsedDayId}\s*[—–-]\s*(.+?)\s*$`,
      "m"
    );
    const match = regex.exec(indexContent);
    if (match) return match[1].trim();
  }
  return `Day ${parsedDayId}`;
}

function extractChallenge(content: string): ParsedTopicSections {
  const headingMatch = /^##\s+(.+Coding Challenge with Solution.*)$/m.exec(
    content
  );

  if (!headingMatch) {
    return {
      lessonContent: content,
      challenge: null,
    };
  }

  const heading = headingMatch[1].trim();
  const headingIndex = headingMatch.index ?? -1;

  if (headingIndex === -1) {
    return {
      lessonContent: content,
      challenge: null,
    };
  }

  const section = content.slice(headingIndex);
  const challengeMatch =
    /###\s+Challenge\s*\n([\s\S]*?)\n###\s+Solution\s*\n([\s\S]*?)(?:\n##\s+|$)/.exec(
      section
    );

  if (!challengeMatch) {
    return {
      lessonContent: content,
      challenge: null,
    };
  }

  return {
    lessonContent: content.slice(0, headingIndex).trimEnd(),
    challenge: {
      heading,
      challengeMarkdown: challengeMatch[1].trim(),
      solutionMarkdown: challengeMatch[2].trim(),
    },
  };
}

export function getAllDays(): Day[] {
  let indexContent: string | null = null;
  const indexPath = path.join(CONTENT_DIR, "index.md");
  if (fs.existsSync(indexPath)) {
    indexContent = fs.readFileSync(indexPath, "utf-8");
  }

  const entries = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });
  const days: Day[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || !entry.name.startsWith("day-")) continue;

    const dayId = entry.name.replace("day-", "");
    const dayDir = path.join(CONTENT_DIR, entry.name);
    const files = fs
      .readdirSync(dayDir)
      .filter((f) => f.endsWith(".md"))
      .sort((left, right) => left.localeCompare(right));

    const topics: Topic[] = files.map((filename) => {
      const content = fs.readFileSync(path.join(dayDir, filename), "utf-8");
      const id = filename.replace(".md", "");
      const parsedSections = extractChallenge(content);

      return {
        id,
        title: extractTitle(content),
        content,
        lessonContent: parsedSections.lessonContent,
        filename,
        challenge: parsedSections.challenge,
      };
    });

    days.push({
      id: dayId,
      label: `Day ${Number.parseInt(dayId, 10)}`,
      title: parseDayTitle(dayId, indexContent),
      topics,
    });
  }

  return days.sort(
    (a, b) => Number.parseInt(a.id, 10) - Number.parseInt(b.id, 10)
  );
}

export function getDay(dayId: string): Day | undefined {
  return getAllDays().find((d) => d.id === dayId);
}

export function getTopic(
  dayId: string,
  topicId: string
): { day: Day; topic: Topic; topicIndex: number } | undefined {
  const day = getDay(dayId);
  if (!day) return undefined;
  const topicIndex = day.topics.findIndex((t) => t.id === topicId);
  if (topicIndex === -1) return undefined;
  return { day, topic: day.topics[topicIndex], topicIndex };
}
