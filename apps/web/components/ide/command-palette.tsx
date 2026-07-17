"use client";

import { Command, useCommandState } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTE_FILES, type IdeFile, type IdeIcon } from "@/lib/ide-route";

export interface PaletteDoc {
  slug: string;
  title: string;
  searchText: string;
}

interface CommandPaletteProps {
  posts: PaletteDoc[];
  caseStudies: PaletteDoc[];
}

interface PaletteItemProps {
  href: string;
  icon: IdeIcon;
  path?: string;
  searchText?: string;
  onOpenRoute: (href: string) => void;
  children: string;
}

const FIXED_ROUTES: readonly IdeFile[] = [
  ROUTE_FILES["/"],
  ROUTE_FILES["/blog"],
  ROUTE_FILES["/projects"],
  ROUTE_FILES["/estudos"],
  ROUTE_FILES["/sobre"],
];

const EXCERPT_RADIUS = 40;
const TITLE_MATCH_SCORE = 1;
const CONTENT_MATCH_SCORE = 0.5;

function matchTitleOrContent(
  value: string,
  search: string,
  keywords?: string[],
): number {
  const query = search.trim().toLowerCase();
  if (query.length === 0) return TITLE_MATCH_SCORE;
  if (value.toLowerCase().includes(query)) return TITLE_MATCH_SCORE;
  const matchesContent =
    keywords?.some((text) => text.includes(query)) ?? false;
  return matchesContent ? CONTENT_MATCH_SCORE : 0;
}

function deriveContentExcerpt(
  matchedValue: string,
  searchText: string | undefined,
  search: string,
): string | null {
  const query = search.trim().toLowerCase();
  if (query.length === 0 || !searchText) return null;
  if (matchedValue.toLowerCase().includes(query)) return null;
  const matchIndex = searchText.indexOf(query);
  if (matchIndex === -1) return null;
  const start = Math.max(0, matchIndex - EXCERPT_RADIUS);
  const end = Math.min(
    searchText.length,
    matchIndex + query.length + EXCERPT_RADIUS,
  );
  const prefix = start > 0 ? "…" : "";
  const suffix = end < searchText.length ? "…" : "";
  return `${prefix}${searchText.slice(start, end)}${suffix}`;
}

function PaletteItem({
  href,
  icon,
  path,
  searchText,
  onOpenRoute,
  children,
}: PaletteItemProps) {
  const search = useCommandState((state) => state.search);
  const matchedValue = path ? `${children} ${path}` : children;
  const excerpt = deriveContentExcerpt(matchedValue, searchText, search);

  return (
    <Command.Item
      value={matchedValue}
      keywords={searchText ? [searchText] : undefined}
      onSelect={() => onOpenRoute(href)}
      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-muted-2 data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent"
    >
      <span aria-hidden>{icon}</span>
      <span className="min-w-0 flex-1">
        <span className="block truncate">{children}</span>
        {excerpt && (
          <span aria-hidden className="block truncate text-[11px] text-muted-2">
            {excerpt}
          </span>
        )}
      </span>
      {path && (
        <span className="ml-auto shrink-0 text-[11px] text-faint">{path}</span>
      )}
    </Command.Item>
  );
}

export function CommandPalette({ posts, caseStudies }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const togglePalette = (event: KeyboardEvent) => {
      const isPaletteShortcut =
        (event.metaKey || event.ctrlKey) && event.key === "k";
      if (!isPaletteShortcut) return;
      event.preventDefault();
      setOpen((wasOpen) => !wasOpen);
    };
    document.addEventListener("keydown", togglePalette);
    return () => document.removeEventListener("keydown", togglePalette);
  }, []);

  const openRoute = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  return (
    <>
      <button
        type="button"
        aria-label="buscar"
        onClick={() => setOpen(true)}
        className="hidden items-center rounded-sm border border-line bg-surface px-2 py-1 font-mono text-[11px] text-faint transition-colors hover:text-foreground sm:inline-flex"
      >
        ⌘K para buscar
      </button>
      <Command.Dialog
        open={open}
        onOpenChange={setOpen}
        label="buscar"
        filter={matchTitleOrContent}
        overlayClassName="fixed inset-0 z-40 bg-black/50"
        contentClassName="fixed top-[18%] left-1/2 z-50 w-[min(560px,calc(100vw-2rem))] -translate-x-1/2"
        className="flex w-full flex-col overflow-hidden rounded-md border border-line bg-surface font-mono shadow-xl outline-none"
      >
        <Command.Input
          placeholder="buscar arquivos, posts e estudos…"
          className="border-b border-line bg-transparent px-4 py-3 text-sm text-foreground outline-none placeholder:text-faint"
        />
        <Command.List className="max-h-[min(320px,50dvh)] overflow-y-auto p-2 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:tracking-[0.14em] [&_[cmdk-group-heading]]:text-faint">
          <Command.Empty className="px-2 py-6 text-center text-xs text-faint">
            nenhum resultado
          </Command.Empty>
          <Command.Group heading="arquivos">
            {FIXED_ROUTES.map((file) => (
              <PaletteItem
                key={file.href}
                href={file.href}
                icon={file.icon}
                onOpenRoute={openRoute}
              >
                {file.label}
              </PaletteItem>
            ))}
          </Command.Group>
          <Command.Group heading="posts">
            {posts.map((post) => (
              <PaletteItem
                key={post.slug}
                href={`/blog/${post.slug}`}
                icon="📝"
                path={`blog/${post.slug}.mdx`}
                searchText={post.searchText}
                onOpenRoute={openRoute}
              >
                {post.title}
              </PaletteItem>
            ))}
          </Command.Group>
          <Command.Group heading="estudos">
            {caseStudies.map((study) => (
              <PaletteItem
                key={study.slug}
                href={`/estudos/${study.slug}`}
                icon="📄"
                path={`estudos/${study.slug}.mdx`}
                searchText={study.searchText}
                onOpenRoute={openRoute}
              >
                {study.title}
              </PaletteItem>
            ))}
          </Command.Group>
        </Command.List>
      </Command.Dialog>
    </>
  );
}
