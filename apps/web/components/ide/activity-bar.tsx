"use client";

import Link from "next/link";
import { cn } from "@gabriel/ui";
import { REPO_URL } from "@/lib/site";

const iconClasses = (active: boolean) =>
  cn(
    "flex size-9 items-center justify-center text-lg transition-colors hover:text-foreground",
    active ? "-ml-0.5 border-l-2 border-accent text-accent" : "text-muted-2",
  );

export function ActivityBar({
  explorerOpen,
  onToggleExplorer,
  terminalOpen,
  onToggleTerminal,
}: {
  explorerOpen: boolean;
  onToggleExplorer: () => void;
  terminalOpen: boolean;
  onToggleTerminal: () => void;
}) {
  return (
    <aside className="hidden w-[52px] shrink-0 flex-col items-center gap-1.5 border-r border-line bg-background-2 py-3.5 md:flex">
      <button
        type="button"
        aria-label={explorerOpen ? "recolher explorer" : "mostrar explorer"}
        title={explorerOpen ? "recolher explorer" : "mostrar explorer"}
        onClick={onToggleExplorer}
        className={iconClasses(explorerOpen)}
      >
        <span aria-hidden>🗂</span>
      </button>
      <button
        type="button"
        aria-label={terminalOpen ? "fechar terminal" : "abrir terminal"}
        title={terminalOpen ? "fechar terminal" : "abrir terminal"}
        onClick={onToggleTerminal}
        className={iconClasses(terminalOpen)}
      >
        <span aria-hidden>❯</span>
      </button>
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="repositório no GitHub"
        title="repositório no GitHub"
        className={iconClasses(false)}
      >
        <span aria-hidden>⑂</span>
      </a>
      <span className="mt-auto flex flex-col gap-1.5">
        <Link
          href="/entrar"
          aria-label="entrar"
          title="entrar"
          className={iconClasses(false)}
        >
          <span aria-hidden>⚙</span>
        </Link>
      </span>
    </aside>
  );
}
