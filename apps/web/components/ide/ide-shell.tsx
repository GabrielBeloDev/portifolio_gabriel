"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { cn } from "@gabriel/ui";
import { ActivityBar } from "./activity-bar";
import { BreadcrumbBar, type BreadcrumbPost } from "./breadcrumb-bar";
import { CommandPalette, type PaletteDoc } from "./command-palette";
import { Explorer, type ExplorerPost } from "./explorer";
import { MobileDrawer } from "./mobile-drawer";
import { ShellHints } from "./shell-hints";
import { StatusBar } from "./status-bar";
import { TabsBar } from "./tabs-bar";
import { TerminalPanel } from "./terminal-panel";
import { WinBar } from "./win-bar";
import type { FsNode } from "@/lib/terminal/types";

export const CONTENT_SCROLL_CONTAINER_ID = "conteudo";

export function IdeShell({
  posts,
  caseStudies,
  ciStatus,
  tags,
  terminalFs,
  children,
}: {
  posts: (ExplorerPost & PaletteDoc & BreadcrumbPost)[];
  caseStudies: PaletteDoc[];
  ciStatus: React.ReactNode;
  tags: string[];
  terminalFs: FsNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLElement>(null);
  const [explorerOpen, setExplorerOpen] = useState(true);
  const [zen, setZen] = useState(false);
  const [terminalOpen, setTerminalOpen] = useState(false);

  // The editor pane is the scroll container, not the window — Next.js only
  // resets window scroll on navigation, so the pane must be reset by hand.
  // A hash deep link would be swallowed by that reset, so it wins instead.
  useEffect(() => {
    const anchorId = decodeURIComponent(window.location.hash.slice(1));
    const anchor = anchorId ? document.getElementById(anchorId) : null;
    if (anchor) {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      anchor.scrollIntoView({
        behavior: prefersReducedMotion ? "auto" : "smooth",
        block: "start",
      });
      return;
    }
    contentRef.current?.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    const handleZenKeys = (event: KeyboardEvent) => {
      const target = event.target;
      const isZenShortcut =
        (event.metaKey || event.ctrlKey) &&
        event.shiftKey &&
        event.key.toLowerCase() === "z";
      if (isZenShortcut) {
        // Cmd+Shift+Z is redo inside editable fields (draft editor); zen
        // must not hijack it
        const isEditableTarget =
          target instanceof HTMLElement &&
          (target instanceof HTMLInputElement ||
            target instanceof HTMLTextAreaElement ||
            target.isContentEditable);
        if (isEditableTarget) return;
        event.preventDefault();
        setZen((wasZen) => !wasZen);
        return;
      }
      // Esc pressed inside an open dialog (palette, drawer) belongs to the
      // dialog, not to zen
      const isEscapeOutsideDialog =
        event.key === "Escape" &&
        !(target instanceof Element && target.closest('[role="dialog"]'));
      if (isEscapeOutsideDialog) setZen(false);
    };
    document.addEventListener("keydown", handleZenKeys);
    return () => document.removeEventListener("keydown", handleZenKeys);
  }, []);

  // VS Code style shortcuts. Ctrl+` and Cmd/Ctrl+J toggle the terminal, Cmd/Ctrl+B
  // the explorer. J and B override Chrome (downloads / nothing) only while the
  // site has focus, which is what an in-browser IDE is expected to do. Shift is
  // excluded so Cmd+Shift+J (Chrome devtools) and zen's Cmd+Shift+Z stay intact.
  useEffect(() => {
    const handleIdeShortcut = (event: KeyboardEvent) => {
      const withModifier = event.metaKey || event.ctrlKey;
      if (!withModifier || event.shiftKey) return;
      const key = event.key.toLowerCase();
      if (event.key === "`" || key === "j") {
        event.preventDefault();
        setTerminalOpen((open) => !open);
      } else if (key === "b") {
        event.preventDefault();
        setExplorerOpen((open) => !open);
      }
    };
    document.addEventListener("keydown", handleIdeShortcut);
    return () => document.removeEventListener("keydown", handleIdeShortcut);
  }, []);

  return (
    <div className={cn("flex h-dvh flex-col overflow-hidden", zen && "zen")}>
      <WinBar
        palette={
          <CommandPalette
            posts={posts}
            caseStudies={caseStudies}
            tags={tags}
            onToggleZen={() => setZen((wasZen) => !wasZen)}
            onToggleTerminal={() => setTerminalOpen((open) => !open)}
          />
        }
        drawer={<MobileDrawer posts={posts} />}
        zen={zen}
        onExitZen={() => setZen(false)}
      />
      <div className="flex min-h-0 flex-1">
        {!zen && (
          <ActivityBar
            explorerOpen={explorerOpen}
            onToggleExplorer={() => setExplorerOpen((open) => !open)}
            terminalOpen={terminalOpen}
            onToggleTerminal={() => setTerminalOpen((open) => !open)}
          />
        )}
        {!zen && explorerOpen && (
          <Explorer
            posts={posts}
            className="hidden w-[246px] shrink-0 border-r border-line md:block"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col bg-background">
          {!zen && <TabsBar />}
          {!zen && <BreadcrumbBar posts={posts} caseStudies={caseStudies} />}
          <main
            id={CONTENT_SCROLL_CONTAINER_ID}
            ref={contentRef}
            // Focusable so the skip link lands reliably and Safari keyboard
            // users can scroll the pane (it never gains focus otherwise)
            tabIndex={-1}
            className="min-h-0 flex-1 overflow-y-auto outline-none"
          >
            <div key={pathname} className="pane-enter min-h-full">
              {children}
            </div>
          </main>
          {!zen && terminalOpen && (
            <TerminalPanel
              fs={terminalFs}
              onClose={() => setTerminalOpen(false)}
            />
          )}
          {!zen && <StatusBar ciStatus={ciStatus} />}
        </div>
      </div>
      <ShellHints />
    </div>
  );
}
