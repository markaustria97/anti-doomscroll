"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";

type Result = {
  groupId: string;
  groupTitle: string;
  dayId: string;
  dayLabel: string;
  topicId: string;
  topicTitle: string;
  snippet: string;
  url: string;
};

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\\]\\]/g, "\\$&");
}

export function SearchBox() {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  function highlight(text: string, query: string) {
    const qTrim = query.trim();
    if (!qTrim) return text;
    const parts = text.split(new RegExp(`(${escapeRegExp(qTrim)})`, "ig"));
    return parts.map((part, i) =>
      part.toLowerCase() === qTrim.toLowerCase() ? (
        <span
          key={`${i}-${part.slice(0, 12)}`}
          className="text-[var(--accent)] font-semibold"
        >
          {part}
        </span>
      ) : (
        <span key={`${i}-${part.slice(0, 12)}`}>{part}</span>
      )
    );
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // Toggle visible on Ctrl+/ (or Cmd+/ on mac)
      if ((e.ctrlKey || e.metaKey) && e.key === "/") {
        const active = document.activeElement;
        if (
          active &&
          (active.tagName === "INPUT" ||
            active.tagName === "TEXTAREA" ||
            (active as HTMLElement).isContentEditable)
        ) {
          return;
        }
        e.preventDefault();
        setVisible(true);
        // focus after render
        setTimeout(() => inputRef.current?.focus(), 0);
        return;
      }

      if (e.key === "Escape") {
        setOpen(false);
        setVisible(false);
        inputRef.current?.blur();
      }
    };

    globalThis.addEventListener("keydown", onKey);
    return () => globalThis.removeEventListener("keydown", onKey);
  }, []);

  // Hide when clicking/tapping outside the search box
  useEffect(() => {
    if (!visible) return;
    const onPointerDown = (ev: PointerEvent) => {
      const target = ev.target as Node | null;
      if (!wrapperRef.current) return;
      if (target && !wrapperRef.current.contains(target)) {
        setVisible(false);
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [visible]);

  useEffect(() => {
    if (!q) {
      setResults([]);
      setOpen(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    const id = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        if (!res.ok) {
          setResults([]);
          setOpen(false);
          return;
        }
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } catch (err) {
        if ((err as any)?.name === "AbortError") return;
        setResults([]);
        setOpen(false);
      }
    }, 250);

    return () => {
      clearTimeout(id);
      controller.abort();
    };
  }, [q]);

  return (
    <div ref={wrapperRef} className="relative text-left">
      {visible && (
        <>
          <div className="flex items-center gap-2">
            <svg
              className="w-4 h-4 text-[var(--accent)]"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35"
              />
              <circle cx="11" cy="11" r="6" strokeWidth={2} />
            </svg>
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search topics... (Ctrl+/)"
              aria-label="Search"
              className="w-64 md:w-80 rounded px-3 py-2 border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
              onFocus={() => {
                if (results.length) setOpen(true);
              }}
            />
          </div>

          {open && results.length > 0 && (
            <ul className="absolute right-0 mt-2 w-80 max-h-64 overflow-auto bg-[var(--bg-card)] border border-[var(--border)] rounded shadow-lg z-50">
              {results.map((r) => (
                <li
                  key={`${r.groupId}-${r.dayId}-${r.topicId}`}
                  className="p-3 hover:bg-[var(--bg-card)]/60 transition-colors"
                >
                  <Link href={r.url} className="block">
                    <div className="text-sm font-semibold text-[var(--text)]">
                      {r.topicTitle}
                    </div>
                    <div className="text-xs text-[var(--text-muted)]">
                      {r.groupTitle} • {r.dayLabel}
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">
                      {highlight(r.snippet, q)}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
