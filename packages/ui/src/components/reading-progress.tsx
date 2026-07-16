"use client";

import { useEffect, useRef } from "react";
import { cn } from "../lib/cn";

interface ReadingProgressProps {
  className?: string;
  scrollContainerId?: string;
}

// Writes height straight to the DOM via rAF — setState here would re-render on every scroll
export function ReadingProgress({
  className,
  scrollContainerId,
}: ReadingProgressProps) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = scrollContainerId
      ? document.getElementById(scrollContainerId)
      : null;
    const target = container ?? document.documentElement;
    const listenTarget: EventTarget = container ?? window;
    let frame = 0;

    const update = () => {
      frame = 0;
      const scrollable = target.scrollHeight - target.clientHeight;
      const progress = scrollable > 0 ? target.scrollTop / scrollable : 0;
      if (barRef.current) {
        barRef.current.style.height = `${(progress * 100).toFixed(2)}%`;
      }
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    listenTarget.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      listenTarget.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, [scrollContainerId]);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-y-0 w-px", className)}
    >
      <div ref={barRef} className="w-full bg-accent" style={{ height: "0%" }} />
    </div>
  );
}
