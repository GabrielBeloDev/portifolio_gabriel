"use client";

import { OPEN_PALETTE_EVENT } from "@/lib/command-palette-event";

// Looks like a search field but opens the shared palette, which already
// searches post titles and body text, instead of duplicating the search.
export function BlogSearch() {
  return (
    <button
      type="button"
      aria-label="buscar posts"
      onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
      className="mb-9 flex w-full max-w-md items-center gap-2 rounded-md border border-line bg-surface px-3 py-2 text-left font-mono text-sm text-muted-2 transition-colors hover:border-line-2 hover:text-muted"
    >
      <span aria-hidden>⌕</span>
      buscar posts por título ou conteúdo
      <kbd className="ml-auto hidden rounded border border-line px-1.5 text-[11px] text-faint sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
