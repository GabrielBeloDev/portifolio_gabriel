"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useId, useState } from "react";
import { cn } from "@gabriel/ui";
import {
  ROUTE_FILES,
  USES_DOTFILES,
  type IdeFile,
  type IdeIcon,
} from "@/lib/ide-route";

export interface ExplorerPost {
  slug: string;
  title: string;
}

interface ExplorerProps {
  posts: ExplorerPost[];
  onNavigate?: () => void;
  className?: string;
}

interface ExplorerGroupProps {
  label: string;
  indent?: boolean;
  children: React.ReactNode;
}

interface ExplorerLinkProps {
  href: string;
  icon: IdeIcon;
  onNavigate?: () => void;
  indent?: boolean;
  title?: string;
  children: React.ReactNode;
}

const TOP_FILES: readonly IdeFile[] = [ROUTE_FILES["/"], ROUTE_FILES["/sobre"]];
const BOTTOM_FILES: readonly IdeFile[] = [
  ROUTE_FILES["/projects"],
  ROUTE_FILES["/estudos"],
  ROUTE_FILES["/entrar"],
  ROUTE_FILES["/commits"],
];

function ExplorerGroup({ label, indent = false, children }: ExplorerGroupProps) {
  const [open, setOpen] = useState(true);
  const contentId = useId();

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={contentId}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
        className={cn(
          "flex w-full items-center gap-1.5 pt-2 pr-4 pb-1 text-left text-xs text-muted-2 transition-colors hover:text-foreground",
          indent ? "pl-6" : "pl-4",
        )}
      >
        <span
          aria-hidden
          className={cn(
            "inline-block text-faint transition-transform motion-reduce:transition-none",
            !open && "-rotate-90",
          )}
        >
          ⌄
        </span>
        {label}
      </button>
      <div id={contentId} hidden={!open}>
        {children}
      </div>
    </>
  );
}

function ExplorerLink({
  href,
  icon,
  onNavigate,
  indent = false,
  title,
  children,
}: ExplorerLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={title}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "block truncate border-l-2 border-transparent py-1.5 pr-4 transition-colors",
        indent ? "pl-10" : "pl-6",
        isActive
          ? "border-accent bg-accent-soft text-accent"
          : "text-faint hover:bg-surface hover:text-foreground",
      )}
    >
      <span aria-hidden>{icon}</span> {children}
    </Link>
  );
}

export function Explorer({ posts, onNavigate, className }: ExplorerProps) {
  return (
    <nav
      aria-label="principal"
      className={cn(
        "overflow-y-auto bg-background-2 py-4 font-mono text-[13px]",
        className,
      )}
    >
      <p className="px-4 pb-3 text-[11px] tracking-[0.14em] text-faint">
        EXPLORER
      </p>
      <ExplorerGroup label="PORTIFOLIO_GABRIEL">
        {TOP_FILES.map((file) => (
          <ExplorerLink
            key={file.href}
            href={file.href}
            icon={file.icon}
            onNavigate={onNavigate}
          >
            {file.label}
          </ExplorerLink>
        ))}
        <ExplorerGroup label="blog" indent>
          <ExplorerLink href="/blog" icon="📁" onNavigate={onNavigate} indent>
            index
          </ExplorerLink>
          {posts.map((post) => (
            <ExplorerLink
              key={post.slug}
              href={`/blog/${post.slug}`}
              icon="📝"
              onNavigate={onNavigate}
              indent
              title={post.title}
            >
              {post.slug}.mdx
            </ExplorerLink>
          ))}
        </ExplorerGroup>
        <ExplorerGroup label=".dotfiles" indent>
          {USES_DOTFILES.map((file) => (
            <ExplorerLink
              key={file.anchor}
              href={`/uses#${file.anchor}`}
              icon="⚙"
              onNavigate={onNavigate}
              indent
            >
              {file.filename}
            </ExplorerLink>
          ))}
        </ExplorerGroup>
        {BOTTOM_FILES.map((file) => (
          <ExplorerLink
            key={file.href}
            href={file.href}
            icon={file.icon}
            onNavigate={onNavigate}
          >
            {file.label}
          </ExplorerLink>
        ))}
      </ExplorerGroup>
    </nav>
  );
}
