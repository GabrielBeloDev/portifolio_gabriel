"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ActivityBar } from "./activity-bar";
import { CommandPalette, type PaletteDoc } from "./command-palette";
import { Explorer, type ExplorerPost } from "./explorer";
import { MobileDrawer } from "./mobile-drawer";
import { StatusBar } from "./status-bar";
import { TabsBar } from "./tabs-bar";
import { WinBar } from "./win-bar";

export const CONTENT_SCROLL_CONTAINER_ID = "conteudo";

export function IdeShell({
  posts,
  caseStudies,
  ciStatus,
  children,
}: {
  posts: (ExplorerPost & PaletteDoc)[];
  caseStudies: PaletteDoc[];
  ciStatus: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const contentRef = useRef<HTMLElement>(null);
  const [explorerOpen, setExplorerOpen] = useState(true);

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

  return (
    <div className="flex h-dvh flex-col overflow-hidden">
      <WinBar
        palette={<CommandPalette posts={posts} caseStudies={caseStudies} />}
        drawer={<MobileDrawer posts={posts} />}
      />
      <div className="flex min-h-0 flex-1">
        <ActivityBar
          explorerOpen={explorerOpen}
          onToggleExplorer={() => setExplorerOpen((open) => !open)}
        />
        {explorerOpen && (
          <Explorer
            posts={posts}
            className="hidden w-[246px] shrink-0 border-r border-line md:block"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col bg-background">
          <TabsBar />
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
          <StatusBar ciStatus={ciStatus} />
        </div>
      </div>
    </div>
  );
}
