"use client";

import { useState } from "react";
import Link from "next/link";

interface SidebarGroup {
  id: string;
  label: string;
  title: string;
  days: SidebarDay[];
}

interface SidebarDay {
  id: string;
  label: string;
  title: string;
  topics: { id: string; title: string }[];
}

interface SidebarProps {
  groups: SidebarGroup[];
  currentGroupId: string;
  currentDayId: string;
  currentTopicId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({
  groups,
  currentGroupId,
  currentDayId,
  currentTopicId,
  isOpen,
  onClose,
}: SidebarProps) {
  const currentDayKey = `${currentGroupId}:${currentDayId}`;
  const [expandedGroup, setExpandedGroup] = useState<string>(currentGroupId);
  const [expandedDay, setExpandedDay] = useState<string>(currentDayKey);

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-[var(--bg-sidebar)] border-r border-[var(--border)] transform transition-transform duration-200 ease-out overflow-y-auto ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
          <Link
            href="/"
            onClick={onClose}
            className="inline-flex items-center gap-2 text-lg font-bold text-[var(--accent)]"
          >
            <img
              src="/icons/icon-192x192.png"
              alt="Anti-Doom Scroll"
              className="w-8 h-8 rounded-sm"
            />
            <span className="sr-only">Anti-Doom Scroll</span>
          </Link>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-white transition-colors"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Group and day list */}
        <nav className="p-2">
          {groups.map((group) => {
            const isCurrentGroup = group.id === currentGroupId;

            return (
              <div
                key={group.id}
                className="mb-2 rounded-xl border border-transparent"
              >
                <div className="flex items-stretch gap-2">
                  <Link
                    href={`/group/${group.id}`}
                    onClick={onClose}
                    className={`min-w-0 flex-1 rounded-lg px-3 py-2.5 text-left text-sm transition-colors ${
                      isCurrentGroup
                        ? "bg-[var(--accent-dim)]/15 text-[var(--accent)]"
                        : "text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-white"
                    }`}
                  >
                    <div className="text-[10px] font-mono uppercase tracking-widest opacity-80">
                      {group.label}
                    </div>
                    <div className="mt-1 truncate font-medium">
                      {group.title}
                    </div>
                  </Link>

                  <button
                    onClick={() =>
                      setExpandedGroup(
                        expandedGroup === group.id ? "" : group.id
                      )
                    }
                    className={`rounded-lg px-3 text-[var(--text-muted)] transition-colors hover:bg-[var(--bg-card)] hover:text-white ${
                      isCurrentGroup
                        ? "bg-[var(--accent-dim)]/15 text-[var(--accent)]"
                        : ""
                    }`}
                    aria-label={`Toggle ${group.title}`}
                  >
                    <svg
                      className={`h-4 w-4 transition-transform ${
                        expandedGroup === group.id ? "rotate-90" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </button>
                </div>

                {expandedGroup === group.id && (
                  <div className="mt-1 ml-2 space-y-1">
                    {group.days.map((day) => {
                      const dayKey = `${group.id}:${day.id}`;

                      return (
                        <div key={day.id}>
                          <button
                            onClick={() =>
                              setExpandedDay(
                                expandedDay === dayKey ? "" : dayKey
                              )
                            }
                            className={`w-full flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition-colors ${
                              isCurrentGroup && day.id === currentDayId
                                ? "bg-[var(--accent-dim)]/15 text-[var(--accent)]"
                                : "text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-white"
                            }`}
                          >
                            <span className="font-medium truncate text-left">
                              {day.label} — {day.title}
                            </span>
                            <svg
                              className={`w-4 h-4 shrink-0 ml-2 transition-transform ${
                                expandedDay === dayKey ? "rotate-90" : ""
                              }`}
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </button>

                          {expandedDay === dayKey && (
                            <div className="ml-2 mt-1 space-y-0.5">
                              {day.topics.map((topic) => {
                                const isActive =
                                  group.id === currentGroupId &&
                                  day.id === currentDayId &&
                                  topic.id === currentTopicId;

                                return (
                                  <Link
                                    key={topic.id}
                                    href={`/group/${group.id}/day/${day.id}/${topic.id}`}
                                    prefetch={false}
                                    onClick={onClose}
                                    className={`flex items-start gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                                      isActive
                                        ? "bg-[var(--accent-dim)]/20 text-[var(--accent)] font-medium"
                                        : "text-[var(--text-muted)] hover:bg-[var(--bg-card)] hover:text-white"
                                    }`}
                                  >
                                    <span className="leading-snug">
                                      {topic.title}
                                    </span>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
