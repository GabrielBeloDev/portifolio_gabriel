"use client";

import dynamic from "next/dynamic";
import type { FsNode } from "@/lib/terminal/types";

const TerminalView = dynamic(
  () => import("./terminal-view").then((mod) => mod.TerminalView),
  { ssr: false },
);

export function TerminalPanel({
  fs,
  onClose,
}: {
  fs: FsNode;
  onClose: () => void;
}) {
  return (
    <section
      role="region"
      aria-label="terminal"
      className="hidden h-64 shrink-0 flex-col border-t border-line bg-background-2 md:flex"
    >
      <div className="flex items-center justify-between border-b border-line px-3 py-1.5">
        <span className="font-mono text-xs tracking-wide text-muted-2 uppercase">
          terminal
        </span>
        <button
          type="button"
          aria-label="fechar terminal"
          title="fechar terminal"
          onClick={onClose}
          className="font-mono text-xs text-muted-2 transition-colors hover:text-foreground"
        >
          ✕
        </button>
      </div>
      <div className="min-h-0 flex-1 p-2">
        <TerminalView fs={fs} />
      </div>
    </section>
  );
}
