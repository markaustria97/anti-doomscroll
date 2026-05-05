import { useRef, useCallback } from "react";
import type { TouchEvent } from "react";

type UseSwipeOptions = {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  threshold?: number;
  allowedTime?: number;
};

export function useSwipe({
  onSwipeLeft,
  onSwipeRight,
  threshold = 50,
  allowedTime = 500,
}: UseSwipeOptions) {
  const startX = useRef<number | null>(null);
  const startY = useRef<number | null>(null);
  const startTime = useRef<number | null>(null);
  const ignoreSwipe = useRef(false);

  const onTouchStart = useCallback((e: TouchEvent) => {
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
    startTime.current = Date.now();
    // Detect if the touch started inside a horizontally-scrollable element
    try {
      ignoreSwipe.current = false;
      let node = e.target as HTMLElement | null;
      const boundary = e.currentTarget as HTMLElement | null;
      while (node && node !== boundary) {
        if (node instanceof HTMLElement) {
          const style = globalThis.getComputedStyle(node);
          const overflowX = style.overflowX;
          // treat 'auto', 'scroll', or 'overlay' as scrollable
          if ((overflowX === "auto" || overflowX === "scroll" || overflowX === "overlay") && node.scrollWidth > node.clientWidth) {
            ignoreSwipe.current = true;
            break;
          }
        }
        node = node.parentElement;
      }
    } catch (err) {
      // defensive: if anything goes wrong, don't block swipe
      ignoreSwipe.current = false;
    }
  }, []);

  const onTouchMove = useCallback((_e: TouchEvent) => {
    // Intentionally empty — we evaluate movement on touchend
  }, []);

  const onTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (ignoreSwipe.current) {
        // reset and skip swipe handling when interaction started in a scrollable child
        startX.current = null;
        startY.current = null;
        startTime.current = null;
        ignoreSwipe.current = false;
        return;
      }
      if (startX.current === null || startTime.current === null) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - startX.current;
      const dy = t.clientY - (startY.current ?? 0);
      const dt = Date.now() - startTime.current;

      if (
        Math.abs(dx) > Math.abs(dy) &&
        Math.abs(dx) >= threshold &&
        dt <= allowedTime
      ) {
        if (dx < 0) {
          onSwipeLeft?.();
        } else {
          onSwipeRight?.();
        }
      }

      startX.current = null;
      startY.current = null;
      startTime.current = null;
    },
    [onSwipeLeft, onSwipeRight, threshold, allowedTime]
  );

  return { onTouchStart, onTouchMove, onTouchEnd };
}
