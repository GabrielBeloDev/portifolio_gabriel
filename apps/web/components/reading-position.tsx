"use client";

import { useEffect, useState } from "react";
import { CONTENT_SCROLL_CONTAINER_ID } from "@/components/ide/ide-shell";
import {
  clearReadingPosition,
  getReadingPosition,
  saveReadingPosition,
} from "@/lib/reading-progress-store";

const RESTORE_MIN_SCROLL_TOP = 600;
const IDLE_SAVE_MS = 2000;
const RESUME_TOAST_MS = 3000;
const FINISHED_PROGRESS = 0.95;

export function ReadingPosition({ slug }: { slug: string }) {
  const [showResumeToast, setShowResumeToast] = useState(false);

  useEffect(() => {
    const container = document.getElementById(CONTENT_SCROLL_CONTAINER_ID);
    if (!container) return;

    const saved = getReadingPosition(slug);
    // A hash deep link owns the scroll destination (IdeShell scrolls to the
    // anchor), so restoring on top of it would fight the navigation
    const hasDeepLink = window.location.hash !== "";
    const shouldRestore =
      saved !== null &&
      saved.scrollTop > RESTORE_MIN_SCROLL_TOP &&
      !hasDeepLink;

    let restoreFrame = 0;
    let toastTimer = 0;
    if (shouldRestore) {
      // IdeShell resets the pane to the top after children effects run on
      // navigation; restoring on the next frame lands after that reset
      restoreFrame = requestAnimationFrame(() => {
        container.scrollTo({ top: saved.scrollTop, behavior: "auto" });
        setShowResumeToast(true);
        toastTimer = window.setTimeout(
          () => setShowResumeToast(false),
          RESUME_TOAST_MS,
        );
      });
    }

    let frame = 0;
    let idleTimer = 0;
    let lastScrollTop = 0;
    let lastProgress = 0;
    let hasScrolled = false;

    const persistPosition = () => {
      if (!hasScrolled) return;
      if (lastProgress > FINISHED_PROGRESS) {
        clearReadingPosition(slug);
        return;
      }
      if (lastScrollTop > 0) saveReadingPosition(slug, lastScrollTop);
    };

    // Mirrors the rAF pattern of ReadingProgress (packages/ui); the DOM is not
    // read at unmount because swapping pages can clamp scrollTop before the
    // cleanup save runs, so the last tracked value is persisted instead
    const trackPosition = () => {
      frame = 0;
      hasScrolled = true;
      lastScrollTop = container.scrollTop;
      const scrollable = container.scrollHeight - container.clientHeight;
      lastProgress = scrollable > 0 ? lastScrollTop / scrollable : 1;
      window.clearTimeout(idleTimer);
      idleTimer = window.setTimeout(persistPosition, IDLE_SAVE_MS);
    };

    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(trackPosition);
    };

    container.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", onScroll);
      if (frame !== 0) cancelAnimationFrame(frame);
      if (restoreFrame !== 0) cancelAnimationFrame(restoreFrame);
      window.clearTimeout(idleTimer);
      window.clearTimeout(toastTimer);
      persistPosition();
    };
  }, [slug]);

  return (
    <p
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 bottom-12 z-40 flex justify-center"
    >
      {showResumeToast && (
        <span className="rounded border border-line bg-surface px-3 py-1.5 font-mono text-xs text-muted">
          retomando de onde você parou
        </span>
      )}
    </p>
  );
}
