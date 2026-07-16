"use client";

import { cn } from "@gabriel/ui";
import { useEffect, useMemo, useState } from "react";
import type { Post } from "#velite";
import { CONTENT_SCROLL_CONTAINER_ID } from "@/components/ide/ide-shell";

// Velite doesn't export its TocEntry type; derive it from the generated Post
type TocEntry = Post["toc"][number];

type TocItem = {
  id: string;
  title: string;
  depth: 1 | 2;
};

type PostTocProps = {
  entries: TocEntry[];
  variant: "aside" | "details";
};

function flattenToItems(entries: TocEntry[]): TocItem[] {
  return entries.flatMap((entry) => [
    { id: entry.url.slice(1), title: entry.title, depth: 1 as const },
    ...entry.items.map((child) => ({
      id: child.url.slice(1),
      title: child.title,
      depth: 2 as const,
    })),
  ]);
}

export function PostToc({ entries, variant }: PostTocProps) {
  const items = useMemo(() => flattenToItems(entries), [entries]);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    const scrollContainer = document.getElementById(
      CONTENT_SCROLL_CONTAINER_ID,
    );
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((heading): heading is HTMLElement => heading !== null);
    if (headings.length === 0) return;

    // The negative bottom margin limits the hit area to the top band of the
    // pane, so the section being read wins over the ones still below the fold
    const observer = new IntersectionObserver(
      (observed) => {
        for (const entry of observed) {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        }
      },
      { root: scrollContainer, rootMargin: "0px 0px -70% 0px" },
    );
    for (const heading of headings) observer.observe(heading);
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  const scrollToHeading = (
    event: React.MouseEvent<HTMLAnchorElement>,
    id: string,
  ) => {
    const heading = document.getElementById(id);
    if (!heading) return;
    event.preventDefault();
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    heading.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
    window.history.pushState(null, "", `#${id}`);
    setActiveId(id);
  };

  const list = (
    <ul className="space-y-2.5">
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <li key={item.id} className={cn(item.depth === 2 && "pl-4")}>
            <a
              href={`#${item.id}`}
              aria-current={isActive ? "location" : undefined}
              onClick={(event) => scrollToHeading(event, item.id)}
              className={cn(
                "block text-sm leading-snug transition-colors",
                isActive ? "text-accent" : "text-muted hover:text-accent",
              )}
            >
              {item.title}
            </a>
          </li>
        );
      })}
    </ul>
  );

  if (variant === "details") {
    return (
      <details className="mt-7 rounded-md border border-line bg-surface px-4 py-3 xl:hidden">
        <summary className="cursor-pointer font-mono text-xs tracking-[0.1em] text-muted-2">
          <span aria-hidden="true">{"// "}</span>outline
        </summary>
        <nav aria-label="outline do post" className="mt-3.5">
          {list}
        </nav>
      </details>
    );
  }

  return (
    <aside className="relative hidden xl:block">
      <nav
        aria-label="outline do post"
        className="sticky top-12 max-h-[calc(100dvh-220px)] overflow-y-auto"
      >
        <p className="mb-3.5 font-mono text-xs tracking-[0.1em] text-muted-2">
          <span aria-hidden="true">{"// "}</span>outline
        </p>
        {list}
      </nav>
    </aside>
  );
}
