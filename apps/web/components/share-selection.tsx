"use client";

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cn } from "@gabriel/ui";
import { CONTENT_SCROLL_CONTAINER_ID } from "@/components/ide/ide-shell";

const MIN_SELECTION_CHARS = 10;
const MAX_SELECTION_CHARS = 280;
const POPOVER_GAP_PX = 8;
const POPOVER_CLEARANCE_PX = 56;
const COPY_FEEDBACK_MS = 2000;

type PopoverState = {
  text: string;
  top: number;
  anchorX: number;
  placeAbove: boolean;
};

// "-" is the prefix/suffix separator in text fragment syntax, so it must be
// escaped on top of what encodeURIComponent already covers
function buildShareUrl(text: string) {
  const encodedText = encodeURIComponent(text).replace(/-/g, "%2D");
  return `${window.location.origin}${window.location.pathname}#:~:text=${encodedText}`;
}

function buildTweetIntentUrl(text: string) {
  const params = new URLSearchParams({
    text: `"${text}"`,
    url: buildShareUrl(text),
  });
  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

// LinkedIn's share-offsite endpoint ignores prefilled text, so only the URL goes
function buildLinkedInShareUrl(text: string) {
  const encodedUrl = encodeURIComponent(buildShareUrl(text));
  return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
}

export function ShareSelection({ children }: { children: ReactNode }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);
  const resetCopyTimerRef = useRef<number>(undefined);
  const [popover, setPopover] = useState<PopoverState | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;

    const updateFromSelection = () => {
      const selection = document.getSelection();
      const hasRange =
        selection !== null &&
        !selection.isCollapsed &&
        selection.rangeCount > 0;
      if (!hasRange) {
        setPopover(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const text = selection.toString().trim();
      const isShareable =
        wrapper.contains(range.commonAncestorContainer) &&
        text.length >= MIN_SELECTION_CHARS &&
        text.length <= MAX_SELECTION_CHARS;
      if (!isShareable) {
        setPopover(null);
        return;
      }

      const rect = range.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();
      const scrollContainerTop =
        document
          .getElementById(CONTENT_SCROLL_CONTAINER_ID)
          ?.getBoundingClientRect().top ?? 0;
      const placeAbove = rect.top - scrollContainerTop >= POPOVER_CLEARANCE_PX;
      const top = placeAbove
        ? rect.top - wrapperRect.top - POPOVER_GAP_PX
        : rect.bottom - wrapperRect.top + POPOVER_GAP_PX;

      setCopied(false);
      setPopover({
        text,
        top,
        anchorX: rect.left - wrapperRect.left + rect.width / 2,
        placeAbove,
      });
    };

    const hideOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPopover(null);
    };

    document.addEventListener("selectionchange", updateFromSelection);
    wrapper.addEventListener("mouseup", updateFromSelection);
    document.addEventListener("keydown", hideOnEscape);
    return () => {
      document.removeEventListener("selectionchange", updateFromSelection);
      wrapper.removeEventListener("mouseup", updateFromSelection);
      document.removeEventListener("keydown", hideOnEscape);
    };
  }, []);

  // The popover width is content-driven, so the horizontal viewport clamp can
  // only happen after render, by measuring the element and mutating its style
  useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const popoverEl = popoverRef.current;
    if (popover === null || wrapper === null || popoverEl === null) return;
    const halfWidth = popoverEl.offsetWidth / 2;
    const maxCenterX = wrapper.clientWidth - halfWidth;
    const centerX = Math.min(Math.max(popover.anchorX, halfWidth), maxCenterX);
    popoverEl.style.left = `${centerX - halfWidth}px`;
  }, [popover]);

  const copyLink = async (text: string) => {
    await navigator.clipboard.writeText(buildShareUrl(text));
    setCopied(true);
    window.clearTimeout(resetCopyTimerRef.current);
    resetCopyTimerRef.current = window.setTimeout(
      () => setCopied(false),
      COPY_FEEDBACK_MS,
    );
  };

  return (
    <div ref={wrapperRef} className="relative">
      {children}
      {popover !== null && (
        <div
          ref={popoverRef}
          role="toolbar"
          aria-label="compartilhar trecho"
          style={{ top: popover.top }}
          // Without this, mousedown on the popover collapses the selection and
          // the popover unmounts before the click lands
          onMouseDown={(event) => event.preventDefault()}
          className={cn(
            "absolute left-0 z-10 flex items-center gap-2 rounded-md border border-line bg-surface px-3 py-1.5 font-mono text-xs whitespace-nowrap shadow-xl",
            popover.placeAbove && "-translate-y-full",
          )}
        >
          <button
            type="button"
            aria-label="copiar link"
            onClick={() => copyLink(popover.text)}
            className="cursor-pointer text-muted transition-colors hover:text-accent"
          >
            {copied ? "copiado ✓" : "copiar link"}
          </button>
          <span aria-hidden className="text-faint">
            ·
          </span>
          <a
            href={buildTweetIntentUrl(popover.text)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors hover:text-accent"
          >
            postar no X
          </a>
          <span aria-hidden className="text-faint">
            ·
          </span>
          <a
            href={buildLinkedInShareUrl(popover.text)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted transition-colors hover:text-accent"
          >
            LinkedIn
          </a>
        </div>
      )}
    </div>
  );
}
