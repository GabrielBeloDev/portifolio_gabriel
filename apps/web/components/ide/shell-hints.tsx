"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Toaster, toast } from "sonner";

const HINT_SEEN_KEY = "hint:shell-seen";
const DESKTOP_QUERY = "(min-width: 768px)";
const HINT_DELAY_MS = 1200;
const HINT_DURATION_MS = 9000;

// Mount once in the shell: renders the toast portal and, on a visitor's first
// desktop visit, points out the keyboard shortcuts that are otherwise invisible.
export function ShellHints() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (localStorage.getItem(HINT_SEEN_KEY)) return;
    // The palette shortcut and the terminal only exist on desktop, so a mobile
    // visitor gets no hint about keys they cannot press
    if (!window.matchMedia(DESKTOP_QUERY).matches) return;

    const timer = setTimeout(() => {
      toast("atalhos deste site", {
        description: "⌘K abre a busca e os comandos. Ctrl+` abre o terminal.",
        duration: HINT_DURATION_MS,
      });
      localStorage.setItem(HINT_SEEN_KEY, "1");
    }, HINT_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Toaster
      position="bottom-right"
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      // No action to click and it auto-dismisses, so it never intercepts a
      // click meant for the page underneath
      toastOptions={{ className: "font-mono", style: { pointerEvents: "none" } }}
      style={
        {
          "--normal-bg": "var(--surface)",
          "--normal-border": "var(--line)",
          "--normal-text": "var(--foreground)",
        } as React.CSSProperties
      }
    />
  );
}
