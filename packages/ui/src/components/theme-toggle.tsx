"use client";

import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { Check, Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "../lib/cn";

const THEME_OPTIONS = [
  { value: "light", label: "light", icon: Sun },
  { value: "dark", label: "dark", icon: Moon },
  { value: "system", label: "system", icon: Monitor },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  // The menu only opens after hydration, so `theme` is always defined inside it
  const { theme, setTheme } = useTheme();

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
          className="z-50 min-w-32 rounded-md border border-line bg-surface p-1 shadow-sm"
        >
          <DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
            {THEME_OPTIONS.map(({ value, label, icon: Icon }) => (
              <DropdownMenu.RadioItem
                key={value}
                value={value}
                className="flex cursor-default items-center gap-2 rounded-sm px-2 py-1.5 font-mono text-xs text-muted outline-none select-none data-[highlighted]:bg-accent-soft data-[highlighted]:text-foreground data-[state=checked]:text-accent"
              >
                <Icon aria-hidden className="size-3.5" />
                {label}
                <DropdownMenu.ItemIndicator className="ml-auto">
                  <Check aria-hidden className="size-3" />
                </DropdownMenu.ItemIndicator>
              </DropdownMenu.RadioItem>
            ))}
          </DropdownMenu.RadioGroup>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
