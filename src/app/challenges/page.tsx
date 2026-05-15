import { ChallengeLab } from "@/components/ChallengeLab";
import { getAllGroups, getChallengeCatalog } from "@/lib/content";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Challenge Lab | Anti-Doom Scroll",
  description:
    "Generate fresh Copilot-backed coding challenges from your study tracks and review your solutions in-browser.",
};

interface PageProps {
  searchParams: Promise<{ groups?: string | string[] }>;
}

function normalizeGroupParam(value: string | string[] | undefined): string[] {
  if (!value) {
    return [];
  }

  const joinedValue = Array.isArray(value) ? value.join(",") : value;

  return joinedValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default async function ChallengesPage({
  searchParams,
}: Readonly<PageProps>) {
  const params = await searchParams;
  const groups = getAllGroups();
  const allowedGroupIds = new Set(groups.map((group) => group.id));
  const initialSelectedGroupIds = normalizeGroupParam(params.groups).filter(
    (groupId) => allowedGroupIds.has(groupId)
  );

  return (
    <ChallengeLab
      groups={groups.map((group) => ({
        id: group.id,
        label: group.label,
        title: group.title,
        description: group.description,
        dayCount: group.days.length,
        topicCount: group.days.reduce(
          (topicCount, day) => topicCount + day.topics.length,
          0
        ),
      }))}
      catalog={getChallengeCatalog()}
      initialSelectedGroupIds={initialSelectedGroupIds}
    />
  );
}
