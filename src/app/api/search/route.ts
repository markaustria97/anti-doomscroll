import { NextResponse } from "next/server";
import { getAllGroups } from "@/lib/content";
import type { TechGroup, Day, Topic } from "@/lib/content";

function matchTopic(query: string, group: TechGroup, day: Day, topic: Topic) {
  const hay = [
    topic.title,
    topic.lessonContent,
    topic.content,
    topic.challenge?.challengeMarkdown,
  ]
    .filter(Boolean)
    .join("\n")
    .toLowerCase();

  const idx = hay.indexOf(query);
  if (idx === -1) return null;

  const raw = (topic.lessonContent || topic.content || "").replaceAll(
    /\s+/g,
    " "
  );
  const matchIndex = raw.toLowerCase().indexOf(query);
  const start = Math.max(0, matchIndex - 80);
  const snippet = raw.slice(start, Math.min(start + 220, raw.length)).trim();

  let score = 0;
  if (topic.title.toLowerCase().includes(query)) score += 100;
  if (matchIndex !== -1) score += Math.max(0, 100 - matchIndex);

  return {
    groupId: group.id,
    groupTitle: group.title,
    dayId: day.id,
    dayLabel: day.label,
    topicId: topic.id,
    topicTitle: topic.title,
    snippet,
    url: `/group/${group.id}/day/${day.id}/${topic.id}`,
    score,
  };
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  if (!q) return NextResponse.json({ results: [] });

  const query = q.toLowerCase();
  const groups = getAllGroups();
  const results: Array<Exclude<ReturnType<typeof matchTopic>, null>> = [];

  for (const group of groups) {
    for (const day of group.days) {
      for (const topic of day.topics) {
        const match = matchTopic(query, group, day, topic);
        if (match) results.push(match);
      }
    }
  }

  results.sort((a, b) => b.score - a.score);
  return NextResponse.json({ results: results.slice(0, 50) });
}
