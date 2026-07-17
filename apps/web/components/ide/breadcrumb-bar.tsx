"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Post } from "#velite";
import { cn } from "@gabriel/ui";
import { breadcrumbTrail } from "@/lib/ide-route";

// Velite doesn't export its TocEntry type; derive it from the generated Post
type TocEntry = Post["toc"][number];

export interface BreadcrumbPost {
  slug: string;
  title: string;
  toc: TocEntry[];
}

export interface BreadcrumbDoc {
  slug: string;
  title: string;
}

interface BreadcrumbBarProps {
  posts: BreadcrumbPost[];
  caseStudies: BreadcrumbDoc[];
}

interface TocHeading {
  id: string;
  title: string;
  depth: 1 | 2;
}

const MENU_CONTENT_CLASSES =
  "z-50 max-h-72 min-w-44 max-w-80 overflow-y-auto rounded-md border border-line bg-surface p-1 font-mono text-xs shadow-sm";

const MENU_ITEM_CLASSES =
  "block cursor-pointer truncate rounded-sm px-2 py-1.5 outline-none select-none data-[highlighted]:bg-accent-soft data-[highlighted]:text-accent";

function flattenToc(entries: TocEntry[]): TocHeading[] {
  return entries.flatMap((entry) => [
    { id: entry.url.slice(1), title: entry.title, depth: 1 as const },
    ...entry.items.map((child) => ({
      id: child.url.slice(1),
      title: child.title,
      depth: 2 as const,
    })),
  ]);
}

function scrollToHeading(id: string) {
  const heading = document.getElementById(id);
  if (!heading) return;
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  heading.scrollIntoView({
    behavior: prefersReducedMotion ? "auto" : "smooth",
    block: "start",
  });
  window.history.pushState(null, "", `#${id}`);
}

function CrumbSeparator() {
  return (
    <span aria-hidden className="text-faint">
      ›
    </span>
  );
}

function CrumbTrigger({ children }: { children: React.ReactNode }) {
  return (
    <DropdownMenu.Trigger className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-muted-2 transition-colors hover:bg-surface hover:text-foreground data-[state=open]:bg-surface data-[state=open]:text-foreground">
      {children}
      <span aria-hidden className="text-faint">
        ⌄
      </span>
    </DropdownMenu.Trigger>
  );
}

function SiblingsDropdown({
  section,
  currentSlug,
  siblings,
}: {
  section: "blog" | "estudos";
  currentSlug: string | null;
  siblings: BreadcrumbDoc[];
}) {
  return (
    <DropdownMenu.Root>
      <CrumbTrigger>{section}</CrumbTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className={MENU_CONTENT_CLASSES}
        >
          {siblings.map((doc) => (
            <DropdownMenu.Item key={doc.slug} asChild>
              <Link
                href={`/${section}/${doc.slug}`}
                title={doc.title}
                className={cn(
                  MENU_ITEM_CLASSES,
                  doc.slug === currentSlug ? "text-accent" : "text-muted-2",
                )}
              >
                {doc.slug}.mdx
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

function HeadingsDropdown({
  label,
  headings,
}: {
  label: string;
  headings: TocHeading[];
}) {
  return (
    <DropdownMenu.Root>
      <CrumbTrigger>{label}</CrumbTrigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="start"
          sideOffset={6}
          className={MENU_CONTENT_CLASSES}
        >
          {headings.map((heading) => (
            <DropdownMenu.Item
              key={heading.id}
              onSelect={() => scrollToHeading(heading.id)}
              className={cn(
                MENU_ITEM_CLASSES,
                "text-muted-2",
                heading.depth === 2 && "pl-5",
              )}
            >
              {heading.title}
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}

export function BreadcrumbBar({ posts, caseStudies }: BreadcrumbBarProps) {
  const pathname = usePathname();
  const trail = breadcrumbTrail(pathname);

  const siblings = trail.section === "estudos" ? caseStudies : posts;
  const currentPost =
    trail.section === "blog" && trail.slug !== null
      ? posts.find((post) => post.slug === trail.slug)
      : undefined;
  const headings = currentPost ? flattenToc(currentPost.toc) : [];
  const leafHasHeadings = trail.leafLabel !== null && headings.length > 0;

  return (
    <nav
      aria-label="trilha"
      className="hidden shrink-0 items-center gap-1.5 border-b border-line bg-background px-4 py-1 font-mono text-xs text-muted-2 md:flex"
    >
      <span className="text-faint">portifolio_gabriel</span>
      {trail.section !== null && (
        <>
          <CrumbSeparator />
          <SiblingsDropdown
            section={trail.section}
            currentSlug={trail.slug}
            siblings={siblings}
          />
        </>
      )}
      {trail.leafLabel !== null && (
        <>
          <CrumbSeparator />
          {leafHasHeadings ? (
            <HeadingsDropdown label={trail.leafLabel} headings={headings} />
          ) : (
            <span className="truncate px-1.5 py-0.5">{trail.leafLabel}</span>
          )}
        </>
      )}
    </nav>
  );
}
