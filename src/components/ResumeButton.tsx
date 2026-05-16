"use client";

import { LAST_VISITED_STATE_KEY } from "@/lib/app-state";
import { readAppState, writeAppState } from "@/lib/app-state-client";
import Link from "next/link";
import { useEffect, useState } from "react";

function ignorePersistenceError(task: Promise<unknown>) {
  void task.catch(() => undefined);
}

export function ResumeButton() {
  const [lastPath, setLastPath] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const hydrate = async () => {
      try {
        const values = await readAppState([LAST_VISITED_STATE_KEY]);

        if (isCancelled) {
          return;
        }

        const storedPath =
          typeof values[LAST_VISITED_STATE_KEY] === "string"
            ? values[LAST_VISITED_STATE_KEY]
            : null;

        if (storedPath) {
          setLastPath(storedPath);
          return;
        }
      } catch {
        if (isCancelled) {
          return;
        }
      }

      const legacyPath = localStorage.getItem(LAST_VISITED_STATE_KEY);
      if (legacyPath) {
        setLastPath(legacyPath);
        ignorePersistenceError(
          writeAppState([
            {
              key: LAST_VISITED_STATE_KEY,
              value: legacyPath,
            },
          ])
        );
      }
    };

    void hydrate();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (!lastPath) return null;

  return (
    <Link
      href={lastPath}
      className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent-dim)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent)]"
    >
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      Resume
    </Link>
  );
}
