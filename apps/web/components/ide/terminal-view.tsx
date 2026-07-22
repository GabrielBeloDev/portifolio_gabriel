"use client";

import { FitAddon } from "@xterm/addon-fit";
import { Terminal } from "@xterm/xterm";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef } from "react";
import { runCommand } from "@/lib/terminal/commands";
import type { FsNode, LineTone } from "@/lib/terminal/types";
import "@xterm/xterm/css/xterm.css";

const RESET = "\x1b[0m";
const TONE_ANSI: Record<LineTone, string> = {
  default: RESET,
  accent: "\x1b[38;5;214m",
  faint: "\x1b[90m",
  error: "\x1b[31m",
  dir: "\x1b[36m",
};

const DARK_THEME = {
  background: "#0d1017",
  foreground: "#e6e9ee",
  cursor: "#e6a23c",
  brightBlack: "#565d6b",
};
const LIGHT_THEME = {
  background: "#f7f5f0",
  foreground: "#1a1e26",
  cursor: "#b5730f",
  brightBlack: "#8a8f99",
};

const WELCOME = "digite help para ver os comandos";

export function TerminalView({ fs }: { fs: FsNode }) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const termRef = useRef<Terminal | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const term = new Terminal({
      convertEol: true,
      cursorBlink: !prefersReducedMotion,
      fontSize: 13,
      fontFamily: "var(--font-jetbrains), ui-monospace, monospace",
      screenReaderMode: true,
      theme: resolvedTheme === "light" ? LIGHT_THEME : DARK_THEME,
    });
    const fit = new FitAddon();
    term.loadAddon(fit);
    term.open(container);
    fit.fit();
    termRef.current = term;

    // Let the app keep its global shortcuts even while the terminal has focus
    term.attachCustomKeyEventHandler((event) => {
      const meta = event.metaKey || event.ctrlKey;
      if (meta && event.key.toLowerCase() === "k") return false;
      if (event.ctrlKey && event.key === "`") return false;
      if (meta && event.shiftKey && event.key.toLowerCase() === "z") return false;
      // Cmd/Ctrl+J toggles the terminal and Cmd/Ctrl+B the explorer, so the
      // shell must handle them even while the terminal has focus
      if (meta && event.key.toLowerCase() === "j") return false;
      if (meta && event.key.toLowerCase() === "b") return false;
      return true;
    });

    let buffer = "";
    const history: string[] = [];
    let historyIndex = 0;
    const cwd = { current: "/" };

    const promptText = () => {
      const display = cwd.current === "/" ? "~" : `~${cwd.current}`;
      return `${TONE_ANSI.accent}➜${RESET} ${TONE_ANSI.dir}${display}${RESET} $ `;
    };
    const writePrompt = () => term.write(promptText());
    const replaceLine = (next: string) => {
      term.write("\r\x1b[2K");
      writePrompt();
      term.write(next);
      buffer = next;
    };

    const submit = () => {
      term.write("\r\n");
      const result = runCommand(buffer, fs, { cwd: cwd.current });
      if (buffer.trim()) history.push(buffer);
      historyIndex = history.length;
      if (result.clear) term.clear();
      for (const line of result.output) {
        term.writeln(`${TONE_ANSI[line.tone ?? "default"]}${line.text}${RESET}`);
      }
      if (result.newCwd !== undefined) cwd.current = result.newCwd;
      buffer = "";
      if (result.navigateTo) router.push(result.navigateTo);
      writePrompt();
    };

    term.onData((data) => {
      if (data === "\r") return submit();
      if (data === "\x7f") {
        if (buffer.length > 0) {
          buffer = buffer.slice(0, -1);
          term.write("\b \b");
        }
        return;
      }
      if (data === "\x1b[A") {
        if (history.length === 0) return;
        historyIndex = Math.max(0, historyIndex - 1);
        const previous = history[historyIndex];
        if (previous !== undefined) replaceLine(previous);
        return;
      }
      if (data === "\x1b[B") {
        if (historyIndex >= history.length) return;
        historyIndex = Math.min(history.length, historyIndex + 1);
        replaceLine(history[historyIndex] ?? "");
        return;
      }
      if (data === "\x03") {
        term.write("^C");
        buffer = "";
        writePrompt();
        return;
      }
      if (data >= " ") {
        buffer += data;
        term.write(data);
      }
    });

    term.writeln(`${TONE_ANSI.faint}${WELCOME}${RESET}`);
    writePrompt();
    term.focus();

    const resize = new ResizeObserver(() => fit.fit());
    resize.observe(container);
    const onFontsReady = () => fit.fit();
    document.fonts.ready.then(onFontsReady);

    return () => {
      resize.disconnect();
      term.dispose();
      termRef.current = null;
    };
    // fs never changes at runtime (built once on the server); a remount on theme
    // change would wipe scrollback, so theme is applied in the effect below
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fs, router]);

  useEffect(() => {
    const term = termRef.current;
    if (!term) return;
    term.options.theme = resolvedTheme === "light" ? LIGHT_THEME : DARK_THEME;
  }, [resolvedTheme]);

  return <div ref={containerRef} className="h-full w-full" />;
}
