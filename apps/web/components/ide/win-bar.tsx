"use client";

import { usePathname } from "next/navigation";
import { ThemeToggle } from "@gabriel/ui";
import { UserMenu } from "@/components/user-menu";
import { ideCrumb } from "@/lib/ide-route";

const WINDOW_DOTS = ["#ff5f57", "#febc2e", "#28c840"] as const;

export function WinBar({
  palette,
  drawer,
}: {
  palette: React.ReactNode;
  drawer: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <header className="flex shrink-0 items-center gap-2 border-b border-line bg-background-2 px-4 py-2.5">
      <span aria-hidden className="flex gap-2">
        {WINDOW_DOTS.map((color) => (
          <span
            key={color}
            className="size-3 rounded-full"
            style={{ backgroundColor: color }}
          />
        ))}
      </span>
      <span className="ml-3 truncate font-mono text-xs text-faint">
        gabriel belo — dev ·{" "}
        <span className="text-muted-2">{ideCrumb(pathname)}</span>
      </span>
      <span className="ml-auto flex shrink-0 items-center gap-3">
        {palette}
        <UserMenu />
        <ThemeToggle />
        {drawer}
      </span>
    </header>
  );
}
