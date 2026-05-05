import Link from "next/link";
import { getAllGroups, getGroup, getDay } from "@/lib/content";
import { SwipeNavigator } from "@/components/SwipeNavigator";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ groupId: string; dayId: string }>;
}

export function generateStaticParams() {
  const params: { groupId: string; dayId: string }[] = [];

  for (const group of getAllGroups()) {
    for (const day of group.days) {
      params.push({ groupId: group.id, dayId: day.id });
    }
  }

  return params;
}

export async function generateMetadata({ params }: PageProps) {
  const { groupId, dayId } = await params;
  const group = getGroup(groupId);
  const day = getDay(dayId, groupId);
  if (!group || !day) return { title: "Not Found" };

  return {
    title: `${day.label}: ${day.title} — ${group.title} | Anti-Doom Scroll`,
    description: `${group.title} — ${day.title}`,
  };
}

export default async function DayIndex({ params }: Readonly<PageProps>) {
  const { groupId, dayId } = await params;
  const group = getGroup(groupId);
  const day = getDay(dayId, groupId);

  if (!group || !day) notFound();

  const days = group.days;
  const dayIndex = days.findIndex((d) => d.id === day.id);
  const prevDay = dayIndex > 0 ? days[dayIndex - 1] : null;
  const nextDay = dayIndex < days.length - 1 ? days[dayIndex + 1] : null;
  const prevHref = prevDay
    ? `/group/${group.id}/day/${prevDay.id}/${prevDay.topics[0]?.id || ""}`
    : undefined;
  const nextHref = nextDay
    ? `/group/${group.id}/day/${nextDay.id}/${nextDay.topics[0]?.id || ""}`
    : undefined;

  return (
    <SwipeNavigator prevHref={prevHref} nextHref={nextHref}>
      <main className="min-h-screen px-6 sm:px-12 py-8 max-w-7xl mx-auto">
        <header className="mb-8">
          <Link
            href={`/group/${group.id}`}
            className="inline-flex items-center text-sm text-[var(--accent)] hover:underline"
          >
            Back to {group.title}
          </Link>

          <div className="mt-4 flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-[var(--accent)]">
            <span>{group.label}</span>
            <span className="text-[var(--text-muted)]">
              {group.days.length} days
            </span>
          </div>

          <h1 className="mt-3 text-3xl sm:text-4xl font-bold">{day.title}</h1>
          <p className="mt-3 max-w-3xl text-sm sm:text-base text-[var(--text-muted)]">
            {group.description}
          </p>
        </header>

        <section className="auto-grid">
          {day.topics.map((topic, idx) => (
            <Link
              key={topic.id}
              href={`/group/${group.id}/day/${day.id}/${topic.id}`}
              prefetch={false}
              className="group block rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all hover:border-[var(--accent-dim)] hover:shadow-lg card-large"
            >
              <div className="text-xs font-mono uppercase tracking-widest text-[var(--accent)]">
                Topic {idx + 1}
              </div>
              <h3 className="mt-2 text-lg font-semibold text-[var(--text)] group-hover:text-white transition-colors">
                {topic.title}
              </h3>
            </Link>
          ))}
        </section>
      </main>
    </SwipeNavigator>
  );
}
