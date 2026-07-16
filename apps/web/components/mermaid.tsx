"use client";

import { useTheme } from "next-themes";
import { useEffect, useId, useState } from "react";

const DARK_VARIABLES = {
  background: "#0b0d10",
  primaryColor: "#171207",
  primaryTextColor: "#e6e9ee",
  primaryBorderColor: "#f5a623",
  secondaryColor: "#101319",
  tertiaryColor: "#101319",
  lineColor: "#98a0ad",
  textColor: "#e6e9ee",
  fontFamily: "JetBrains Mono, monospace",
  fontSize: "14px",
};

const LIGHT_VARIABLES = {
  background: "#f7f8fa",
  primaryColor: "#f7ead2",
  primaryTextColor: "#1a1e26",
  primaryBorderColor: "#9a5b00",
  secondaryColor: "#ffffff",
  tertiaryColor: "#ffffff",
  lineColor: "#565d6b",
  textColor: "#1a1e26",
  fontFamily: "JetBrains Mono, monospace",
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
