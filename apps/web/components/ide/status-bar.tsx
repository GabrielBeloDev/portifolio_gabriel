"use client";

import { usePathname } from "next/navigation";
import { ideCrumb } from "@/lib/ide-route";

const REPO_URL = "https://github.com/GabrielBeloDev/portifolio_gabriel";

export function StatusBar() {
  const pathname = usePathname();

  return (
    <footer className="flex shrink-0 items-center gap-4 bg-accent-fill px-4 py-1.5 font-mono text-xs font-semibold text-on-accent">
      <a
        href={REPO_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="código no GitHub"
        className="hover:underline"
      >
        <span aria-hidden>⑂</span> main
      </a>
      <span className="hidden sm:inline">
        <span aria-hidden>✓</span> 0 problemas
      </span>
      <span className="ml-auto hidden truncate sm:inline">
        {ideCrumb(pathname)}
      </span>
      <span className="hidden md:inline">UTF-8</span>
      <span className="hidden md:inline">LF</span>
      <span className="ml-auto sm:ml-0">
        <span aria-hidden>♥</span> feito por Gabriel
      </span>
    </footer>
  );
}
