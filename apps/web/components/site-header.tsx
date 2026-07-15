import Link from "next/link";
import { ThemeToggle } from "@gabriel/ui";

const NAV_LINKS = [
  { href: "/blog", label: "escritos" },
  { href: "/projects", label: "trabalhos" },
  { href: "/estudos", label: "estudos" },
  { href: "/sobre", label: "sobre" },
] as const;

export function SiteHeader() {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-6 py-4">
        <Link
          href="/"
          className="font-mono text-sm font-medium transition-colors hover:text-accent"
        >
          gabriel belo
        </Link>
        <nav aria-label="principal" className="flex items-center gap-4 sm:gap-5">
          {NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="font-mono text-xs text-muted transition-colors hover:text-accent"
            >
              {label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
