"use client";

import { usePathname } from "next/navigation";
import { ideCrumb } from "@/lib/ide-route";
import { REPO_URL } from "@/lib/site";

export function StatusBar() {
  const pathname = usePathname();

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
      <span className="hidden sm:inline">
        <span aria-hidden className="text-accent">
          ✓
        </span>{" "}
        0 problemas
      </span>
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
