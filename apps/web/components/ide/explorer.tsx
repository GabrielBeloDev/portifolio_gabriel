"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@gabriel/ui";

export interface ExplorerPost {
  slug: string;
  title: string;
}

interface ExplorerProps {
  posts: ExplorerPost[];
  onNavigate?: () => void;
  className?: string;
}

interface ExplorerLinkProps {
  href: string;
  icon: string;
  onNavigate?: () => void;
  indent?: boolean;
  title?: string;
  children: React.ReactNode;
}

function ExplorerGroup({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex items-center gap-1.5 px-4 pt-2 pb-1 text-xs text-muted-2">
      <span aria-hidden className="text-faint">
        ⌄
      </span>
      {children}
    </p>
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
        indent ? "pl-8" : "pl-4",
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
      <ExplorerGroup>PORTIFOLIO_GABRIEL</ExplorerGroup>
      <ExplorerLink href="/" icon="🏠" onNavigate={onNavigate}>
        home.tsx
      </ExplorerLink>
      <ExplorerLink href="/sobre" icon="📄" onNavigate={onNavigate}>
        sobre.md
      </ExplorerLink>
      <ExplorerGroup>blog</ExplorerGroup>
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
      <ExplorerLink href="/projects" icon="📁" onNavigate={onNavigate}>
        projetos
      </ExplorerLink>
      <ExplorerLink href="/estudos" icon="📁" onNavigate={onNavigate}>
        estudos
      </ExplorerLink>
      <ExplorerLink href="/entrar" icon="⚙" onNavigate={onNavigate}>
        auth.config
      </ExplorerLink>
    </nav>
  );
}
