"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { cn } from "../lib/cn";

const THEME_OPTIONS = [
  { value: "light", label: "light", icon: Sun },
  { value: "dark", label: "dark", icon: Moon },
  { value: "system", label: "system", icon: Monitor },
] as const;

const emptySubscribe = () => () => {};

// False during SSR/hydration, true after — without effects or extra renders
function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  // Theme is unknown until the client mounts; render the active check only after
  const mounted = useMounted();

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger
        aria-label="Trocar tema"
        className={cn(
          "inline-flex size-8 items-center justify-center rounded-sm border border-line text-muted transition-colors hover:border-accent hover:text-accent",
          className,
        )}
      >
        <Sun aria-hidden className="size-4 dark:hidden" />
        <Moon aria-hidden className="hidden size-4 dark:block" />
      </DropdownMenu.Trigger>
      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 min-w-28 rounded-md border border-line bg-surface p-1 shadow-sm"
        >
          {THEME_OPTIONS.map(({ value, label, icon: Icon }) => {
            const isActive = mounted && theme === value;
            return (
              <DropdownMenu.Item
                key={value}
                onSelect={() => setTheme(value)}
                className={cn(
                  "flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 font-mono text-xs outline-none select-none data-[highlighted]:bg-accent-soft data-[highlighted]:text-foreground",
                  isActive ? "text-accent" : "text-muted",
                )}
              >
                <Icon aria-hidden className="size-3.5" />
                {label}
              </DropdownMenu.Item>
            );
          })}
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
