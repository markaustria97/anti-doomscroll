import Link from "next/link";
import { getAllGroups, getGroup } from "@/lib/content";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ groupId: string }>;
}

export function generateStaticParams() {
  return getAllGroups().map((group) => ({ groupId: group.id }));
}

export async function generateMetadata({ params }: PageProps) {
  const { groupId } = await params;
  const group = getGroup(groupId);
  if (!group) return { title: "Not Found" };

  return {
    title: `${group.title} | Anti-Doom Scroll`,
    description: group.description,
  };
}

export default async function GroupPage({ params }: Readonly<PageProps>) {
  const { groupId } = await params;
  const group = getGroup(groupId);

  if (!group) notFound();

  return (
    <main className="min-h-screen px-6 sm:px-12 py-8 max-w-7xl mx-auto">
      <header className="mb-10">
        <Link
          href="/"
          className="inline-flex items-center text-sm text-[var(--accent)] hover:underline"
        >
          TECH GROUPS
        </Link>
        <div className="mt-4 flex items-center gap-3 text-xs font-mono uppercase tracking-widest text-[var(--accent)]">
          <span>{group.label}</span>
          <span className="text-[var(--text-muted)]">
            {group.days.length} days
          </span>
        </div>
        <h1 className="mt-3 text-3xl sm:text-4xl font-bold">{group.title}</h1>
        <p className="mt-3 max-w-3xl text-sm sm:text-base text-[var(--text-muted)]">
          {group.description}
        </p>
      </header>

      <div className="auto-grid">
        {group.days.map((day) => (
          <Link
            key={day.id}
            href={`/group/${group.id}/day/${day.id}/${day.topics[0]?.id || ""}`}
            prefetch={false}
            className="group block rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all hover:border-[var(--accent-dim)] hover:shadow-lg hover:shadow-purple-900/10 card-large"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-widest text-[var(--accent)]">
                {day.label}
              </span>
              <span className="text-xs text-[var(--text-muted)]">
                {day.topics.length} topics
              </span>
            </div>
            <h2 className="text-2xl font-semibold text-[var(--text)] group-hover:text-white transition-colors">
              {day.title}
            </h2>
          </Link>
        ))}
      </div>
    </main>
  );
}
