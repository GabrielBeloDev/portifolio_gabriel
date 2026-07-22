"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";
import { Toaster, toast } from "sonner";

const HINT_SEEN_KEY = "hint:shell-seen";
const DESKTOP_QUERY = "(min-width: 768px)";
const HINT_DELAY_MS = 500;
const HINT_DURATION_MS = 9000;

// Mount once in the shell: renders the toast portal and, once per browser
// session on desktop, points out the keyboard shortcuts that stay invisible.
export function ShellHints() {
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    // sessionStorage, not localStorage: the hint shows once per session so a
    // returning visitor sees it again on a fresh visit without being spammed on
    // every reload. Storage throws when blocked (private mode, cookies off,
    // sandboxed iframe), and this hint is optional, so it degrades to nothing
    // instead of taking the whole shell down with it.
    let alreadySeen: string | null;
    try {
      alreadySeen = sessionStorage.getItem(HINT_SEEN_KEY);
    } catch {
      return;
    }
    if (alreadySeen) return;

    // The palette shortcut and the terminal only exist on desktop, so a mobile
    // visitor gets no hint about keys they cannot press
    if (!window.matchMedia(DESKTOP_QUERY).matches) return;

    const timer = setTimeout(() => {
      toast("atalhos deste site", {
        description: "⌘K busca e comandos. ⌘J abre o terminal, ⌘B a barra lateral.",
        duration: HINT_DURATION_MS,
      });
      try {
        sessionStorage.setItem(HINT_SEEN_KEY, "1");
      } catch {
        // If the flag cannot persist the hint may show again, which beats an
        // unhandled error from a throwing setItem
      }
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
