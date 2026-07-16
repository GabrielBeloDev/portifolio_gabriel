"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@gabriel/ui";
import { ideTabs } from "@/lib/ide-route";

export function TabsBar() {
  const pathname = usePathname();
  const tabs = ideTabs(pathname);

  return (
    <nav
      aria-label="abas"
      className="flex shrink-0 overflow-x-auto border-b border-line bg-background-2 font-mono text-[13px]"
    >
      {tabs.map((tab) => {
        const isActive = tab.href === pathname;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "whitespace-nowrap border-t border-r border-r-line px-4 py-2.5 transition-colors",
              isActive
                ? "border-t-accent bg-background text-foreground"
                : "border-t-transparent text-muted-2 hover:text-foreground",
            )}
          >
            <span aria-hidden>{tab.icon}</span> {tab.label}
            {tab.modified && (
              <span aria-hidden className="ml-2 text-accent">
                ●
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
