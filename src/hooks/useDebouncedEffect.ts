"use client";

import { useEffect, type DependencyList } from "react";

export function useDebouncedEffect(
  effect: () => void | (() => void),
  dependencies: DependencyList,
  delayMs: number
) {
  useEffect(() => {
    let cleanup: void | (() => void);
    const timeoutId = globalThis.setTimeout(() => {
      cleanup = effect();
    }, delayMs);

    return () => {
      globalThis.clearTimeout(timeoutId);
      if (typeof cleanup === "function") {
        cleanup();
      }
    };
  }, [delayMs, ...dependencies]);
}
