"use client";

import React from "react";

export function SearchButton() {
  return (
    <button
      aria-label="Open search"
      className="md:hidden inline-flex items-center justify-center rounded-lg p-2 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text)] hover:bg-[var(--bg)]/60"
      onClick={() => globalThis.dispatchEvent(new CustomEvent("open-search"))}
    >
      <svg
        className="w-4 h-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-4.35-4.35"
        />
        <circle cx="11" cy="11" r="6" strokeWidth={2} />
      </svg>
    </button>
  );
}

export default SearchButton;
