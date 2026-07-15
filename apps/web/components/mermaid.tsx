"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

const DARK_VARIABLES = {
  background: "#0e1116",
  primaryColor: "#2a2214",
  primaryTextColor: "#e6e1d8",
  primaryBorderColor: "#ffb020",
  secondaryColor: "#151a21",
  tertiaryColor: "#151a21",
  lineColor: "#9c968b",
  textColor: "#e6e1d8",
  fontFamily: "IBM Plex Mono, monospace",
  fontSize: "14px",
};

const LIGHT_VARIABLES = {
  background: "#f6f5f2",
  primaryColor: "#f0e2cb",
  primaryTextColor: "#1a1d21",
  primaryBorderColor: "#b4690e",
  secondaryColor: "#fdfcfa",
  tertiaryColor: "#fdfcfa",
  lineColor: "#6b665e",
  textColor: "#1a1d21",
  fontFamily: "IBM Plex Mono, monospace",
  fontSize: "14px",
};

export function Mermaid({ chart }: { chart: string }) {
  const { resolvedTheme } = useTheme();
  const [svg, setSvg] = useState<string | null>(null);
  const reactId = useId();

  useEffect(() => {
    let cancelled = false;

    async function render() {
      const mermaid = (await import("mermaid")).default;
      const isDark = resolvedTheme === "dark";
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        themeVariables: isDark ? DARK_VARIABLES : LIGHT_VARIABLES,
        securityLevel: "strict",
      });
      // Mermaid requires a DOM-safe unique id per render
      const renderId = `mermaid-${reactId.replace(/[^a-zA-Z0-9]/g, "")}-${isDark ? "d" : "l"}`;
      const { svg: rendered } = await mermaid.render(renderId, chart);
      if (!cancelled) setSvg(rendered);
    }

    void render();
    return () => {
      cancelled = true;
    };
  }, [chart, resolvedTheme, reactId]);

  if (svg === null) {
    return (
      <div
        role="status"
        className="my-6 flex min-h-24 items-center justify-center rounded-md border border-line font-mono text-xs text-muted"
      >
        renderizando diagrama…
      </div>
    );
  }

  return (
    <figure
      role="img"
      aria-label="Diagrama"
      className="mermaid-diagram my-6 flex justify-center overflow-x-auto rounded-md border border-line bg-surface p-4"
      // SECURITY BOUNDARY: `chart` is authored in this repo's MDX (build-time,
      // not user input) and mermaid runs with securityLevel "strict", which
      // sanitizes its own SVG output. Revisit if charts ever come from users.
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
