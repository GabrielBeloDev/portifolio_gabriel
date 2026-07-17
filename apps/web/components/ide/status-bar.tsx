"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ideCrumb } from "@/lib/ide-route";
import { REPO_URL } from "@/lib/site";
import { CONTENT_SCROLL_CONTAINER_ID } from "./ide-shell";

const READING_ROUTE = /^\/(blog|estudos)\/[^/]+$/;
const WORDS_PER_MINUTE = 200;
const END_OF_READING_MS = 4000;

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

// Mirrors the rAF pattern of ReadingProgress (packages/ui): writes the label
// straight to the DOM — setState here would re-render on every scroll
function ReadingTimeLeft() {
  const labelRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const container = document.getElementById(CONTENT_SCROLL_CONTAINER_ID);
    const article = container?.querySelector("article");
    if (!container || !article) return;

    const totalMinutes = Math.max(
      1,
      Math.round(countWords(article.textContent ?? "") / WORDS_PER_MINUTE),
    );
    let frame = 0;
    let hideTimer = 0;
    let finished = false;

    const setLabel = (text: string) => {
      if (labelRef.current) labelRef.current.textContent = text;
    };

    const update = () => {
      frame = 0;
      const scrollable = container.scrollHeight - container.clientHeight;
      const progress = scrollable > 0 ? container.scrollTop / scrollable : 1;
      const minutesLeft = totalMinutes * (1 - progress);
      if (minutesLeft >= 1) {
        finished = false;
        window.clearTimeout(hideTimer);
        setLabel(`~${Math.round(minutesLeft)} min restantes`);
        return;
      }
      // Announce the end once, then free the slot for good
      if (finished) return;
      finished = true;
      setLabel("fim da leitura");
      hideTimer = window.setTimeout(() => setLabel(""), END_OF_READING_MS);
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
      window.clearTimeout(hideTimer);
    };
  }, []);

  return (
    <span ref={labelRef} aria-hidden="true" className="hidden sm:inline" />
  );
}

export function StatusBar({ ciStatus }: { ciStatus: React.ReactNode }) {
  const pathname = usePathname();
  const isReadingRoute = READING_ROUTE.test(pathname);

  return (
    <footer className="flex shrink-0 items-center gap-4 border-t border-line bg-background-2 px-4 py-1.5 font-mono text-xs font-normal text-muted-2">
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="código no GitHub"
        className="transition-colors hover:text-foreground"
      >
        <span aria-hidden className="text-accent">
          ⑂
        </span>{" "}
        main
      </a>
      {ciStatus}
      {isReadingRoute && <ReadingTimeLeft key={pathname} />}
      <span className="ml-auto hidden truncate sm:inline">
        {ideCrumb(pathname)}
      </span>
      <span className="ml-auto sm:ml-0">
        <span aria-hidden className="text-accent">
          ♥
        </span>{" "}
        feito por Gabriel
      </span>
    </footer>
  );
}
