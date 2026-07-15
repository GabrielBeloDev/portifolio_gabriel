"use client";

import { useEffect, useRef } from "react";
import { cn } from "../lib/cn";

/**
 * Amber reading-progress line drawn over the page rule (post variant of the
 * gutter signature). Writes height directly to the DOM via rAF to avoid
 * re-rendering on every scroll event.
 */
export function ReadingProgress({ className }: { className?: string }) {
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let frame = 0;

    const update = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const progress = scrollable > 0 ? doc.scrollTop / scrollable : 0;
      if (barRef.current) {
        barRef.current.style.height = `${(progress * 100).toFixed(2)}%`;
      }
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-y-0 w-px", className)}
    >
      <div ref={barRef} className="w-full bg-accent" style={{ height: "0%" }} />
    </div>
  );
}
