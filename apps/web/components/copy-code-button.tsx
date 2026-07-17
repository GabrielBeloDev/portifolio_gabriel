"use client";

import { useRef, useState } from "react";

const COPY_FEEDBACK_MS = 2000;

export function CopyCodeButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const resetTimerRef = useRef<number>(undefined);
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    const code = buttonRef.current
      ?.closest("figure")
      ?.querySelector("pre")?.textContent;
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.clearTimeout(resetTimerRef.current);
    resetTimerRef.current = window.setTimeout(
      () => setCopied(false),
      COPY_FEEDBACK_MS,
    );
  };

  return (
    <button
      ref={buttonRef}
      type="button"
      aria-label="copiar código"
      onClick={copyCode}
      className="absolute top-1.5 right-2 cursor-pointer rounded-sm px-1.5 py-0.5 font-mono text-[11px] text-faint transition-colors hover:text-foreground"
    >
      {copied ? "copiado ✓" : "copiar"}
    </button>
  );
}
