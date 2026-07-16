"use client";

import { useEffect, useRef } from "react";
import { cn } from "@gabriel/ui";

export function Reveal({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Flips a class instead of state: no re-render, and reduced-motion users
  // never depend on JS because the CSS media query keeps .reveal visible
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
    <div ref={ref} className={cn("reveal", className)}>
      {children}
    </div>
  );
}
