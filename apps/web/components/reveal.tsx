"use client";

import { useEffect, useRef } from "react";
import { cn } from "@gabriel/ui";

export function Reveal({
  className,
  delay,
  children,
}: {
  className?: string;
  delay?: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Flips a class instead of state: no re-render; the hiding CSS only applies
  // under @media (scripting: enabled), so no-JS visitors see content directly
  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          element.classList.add("reveal-in");
          observer.disconnect();
        }
      },
      { rootMargin: "0px 0px -32px" },
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn("reveal", className)}
      style={delay !== undefined ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  );
}
