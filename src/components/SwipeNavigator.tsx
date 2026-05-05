"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useSwipe } from "@/hooks/useSwipe";

type Props = React.PropsWithChildren<{
  prevHref?: string | null;
  nextHref?: string | null;
}>;

export function SwipeNavigator({ prevHref, nextHref, children }: Props) {
  const router = useRouter();

  const swipe = useSwipe({
    onSwipeLeft: () => {
      if (nextHref) router.push(nextHref);
    },
    onSwipeRight: () => {
      if (prevHref) router.push(prevHref);
    },
  });

  return (
    <div {...swipe} style={{ touchAction: "pan-y" }}>
      {children}
    </div>
  );
}
