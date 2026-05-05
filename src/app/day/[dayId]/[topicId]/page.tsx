import { getAllGroups } from "@/lib/content";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: Promise<{ dayId: string; topicId: string }>;
}

export default async function LegacyTopicRoute({
  params,
}: Readonly<PageProps>) {
  const { dayId, topicId } = await params;

  for (const group of getAllGroups()) {
    const day = group.days.find((entry) => entry.id === dayId);
    const topic = day?.topics.find((entry) => entry.id === topicId);

    if (day && topic) {
      redirect(`/group/${group.id}/day/${dayId}/${topicId}`);
    }
  }

  notFound();
}
