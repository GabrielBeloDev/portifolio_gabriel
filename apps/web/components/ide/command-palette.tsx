"use client";

import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ROUTE_FILES, type IdeFile, type IdeIcon } from "@/lib/ide-route";

export interface PaletteDoc {
  slug: string;
  title: string;
}

interface CommandPaletteProps {
  posts: PaletteDoc[];
  caseStudies: PaletteDoc[];
}

interface PaletteItemProps {
  href: string;
  icon: IdeIcon;
  path?: string;
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

function PaletteItem({
  href,
  icon,
  path,
  onOpenRoute,
  children,
}: PaletteItemProps) {
  return (
    <Command.Item
      onSelect={() => onOpenRoute(href)}
      className="flex cursor-pointer items-center gap-2 rounded-sm px-2 py-1.5 text-[13px] text-muted-2 data-[selected=true]:bg-accent-soft data-[selected=true]:text-accent"
    >
      <span aria-hidden>{icon}</span>
      <span className="truncate">{children}</span>
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
