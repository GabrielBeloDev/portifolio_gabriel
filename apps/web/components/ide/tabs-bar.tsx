"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cn } from "@gabriel/ui";
import { routeTab, ROUTE_FILES, type IdeTab } from "@/lib/ide-route";

const HOME_TAB: IdeTab = { ...ROUTE_FILES["/"], modified: false };

function sessionTabsFor(pathname: string): IdeTab[] {
  const tab = routeTab(pathname);
  return tab && tab.href !== HOME_TAB.href ? [tab] : [];
}

export function TabsBar() {
  const pathname = usePathname();
  const router = useRouter();
  // Tabs accumulate as the visitor opens routes, like editor files; home.tsx
  // is pinned and never closes
  const [sessionTabs, setSessionTabs] = useState<IdeTab[]>(() =>
    sessionTabsFor(pathname),
  );
  // Closing the active tab triggers navigation; until the route actually
  // changes, the adjust-during-render below must not re-open the closed tab
  const [suppressedHref, setSuppressedHref] = useState<string | null>(null);

  // Subroutes (e.g. /admin/editor/<id>) map to a parent tab, so tracking must
  // compare tab hrefs — comparing against pathname would re-add forever
  const currentTab = routeTab(pathname);
  const activeHref = currentTab?.href ?? null;

  if (suppressedHref !== null && suppressedHref !== activeHref) {
    setSuppressedHref(null);
  }

  const isTracked =
    currentTab === null ||
    currentTab.href === HOME_TAB.href ||
    sessionTabs.some((tab) => tab.href === currentTab.href);
  if (currentTab && !isTracked && suppressedHref !== currentTab.href) {
    // Adjust-state-during-render: register the newly visited route as a tab
    setSessionTabs([...sessionTabs, currentTab]);
  }

  const openTabs = [HOME_TAB, ...sessionTabs];

  function closeTab(href: string) {
    const closedIndex = openTabs.findIndex((tab) => tab.href === href);
    const remaining = sessionTabs.filter((tab) => tab.href !== href);
    setSessionTabs(remaining);
    if (activeHref === href) {
      setSuppressedHref(href);
      const neighbor = openTabs[closedIndex - 1] ?? HOME_TAB;
      router.push(neighbor.href);
    }
  }

  return (
    <nav
      aria-label="abas"
      className="flex shrink-0 overflow-x-auto border-b border-line bg-background-2 font-mono text-[13px]"
    >
      {openTabs.map((tab) => {
        const isActive = tab.href === activeHref;
        const isPinned = tab.href === HOME_TAB.href;
        return (
          <span
            key={tab.href}
            className={cn(
              "group flex shrink-0 items-center border-t border-r border-r-line transition-colors",
              isActive
                ? "border-t-accent bg-background text-foreground"
                : "border-t-transparent text-muted-2 hover:text-foreground",
            )}
          >
            <Link
              href={tab.href}
              aria-current={isActive ? "page" : undefined}
              className={cn("whitespace-nowrap py-2.5 pl-4", isPinned && "pr-4")}
            >
              <span aria-hidden>{tab.icon}</span> {tab.label}
              {tab.modified && (
                <span aria-hidden className="ml-2 text-accent">
                  ●
                </span>
              )}
            </Link>
            {!isPinned && (
              <button
                type="button"
                aria-label={`fechar ${tab.label}`}
                onClick={() => closeTab(tab.href)}
                className="px-2 py-2.5 text-muted-2 transition-colors hover:text-danger"
              >
                ×
              </button>
            )}
          </span>
        );
      })}
    </nav>
  );
}
