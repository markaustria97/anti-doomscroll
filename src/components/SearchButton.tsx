"use client";

import React, { useEffect, useState } from "react";

export function SearchButton() {
  const [isMobileView, setIsMobileView] = useState(false);
  const [showButton, setShowButton] = useState(true);

  useEffect(() => {
    const widthMq = window.matchMedia("(max-width: 767px)");
    const pointerMq = window.matchMedia("(pointer: coarse)");
    const isTouch = () =>
      widthMq.matches ||
      pointerMq.matches ||
      (navigator.maxTouchPoints ?? 0) > 0 ||
      "ontouchstart" in window;

    let lastY = window.scrollY;
    let ticking = false;

    const updateIsMobile = () => setIsMobileView(isTouch());

    const onScroll = () => {
      if (!isTouch()) {
        setShowButton(true);
        lastY = window.scrollY;
        return;
      }

      const currentY = window.scrollY;
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(() => {
          const delta = currentY - lastY;
          if (currentY <= 120) {
            setShowButton(true);
          } else if (Math.abs(delta) > 5) {
            if (delta < 0) {
              setShowButton(true);
            } else {
              setShowButton(false);
            }
          }
          lastY = currentY;
          ticking = false;
        });
      }
    };

    [widthMq, pointerMq].forEach((m) => {
      if (m.addEventListener) m.addEventListener("change", updateIsMobile);
      else m.addListener(updateIsMobile as any);
    });
    window.addEventListener("scroll", onScroll, { passive: true });

    // initial state
    updateIsMobile();
    setShowButton(!isTouch() ? true : window.scrollY <= 120);

    return () => {
      [widthMq, pointerMq].forEach((m) => {
        if (m.removeEventListener)
          m.removeEventListener("change", updateIsMobile);
        else m.removeListener(updateIsMobile as any);
      });
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const baseClass =
    "lg:hidden inline-flex items-center justify-center rounded-lg p-2  text-[var(--text)]";

  const visibilityClass = showButton
    ? "translate-y-0 opacity-100"
    : "-translate-y-12 opacity-0 pointer-events-none";

  return (
    <button
      aria-label="Open search"
      className={`${baseClass} ${visibilityClass}`}
      onClick={() => globalThis.dispatchEvent(new CustomEvent("open-search"))}
    >
      <svg
        className="w-4.5 h-4.5"
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
