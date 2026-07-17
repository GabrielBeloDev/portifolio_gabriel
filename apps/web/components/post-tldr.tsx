"use client";

import { useEffect, useState } from "react";

async function fetchTldrBullets(slug: string): Promise<string[] | null> {
  const response = await fetch(`/api/tldr/${encodeURIComponent(slug)}`);
  // 204 means the summary is legitimately unavailable (no Groq key or failure)
  if (response.status !== 200) return null;
  const payload = (await response.json()) as { bullets: string[] };
  return payload.bullets;
}

export function PostTldr({ slug }: { slug: string }) {
  const [bullets, setBullets] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetchTldrBullets(slug)
      .then((result) => {
        if (!cancelled && result) setBullets(result);
      })
      .catch((error: unknown) => {
        // Summary is an enhancement: log loud, render nothing
        console.error("tl;dr fetch failed", error);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (bullets.length === 0) return null;

  return (
    <details
      open
      data-tldr
      className="mt-7 rounded-md border border-line bg-surface px-4 py-3"
    >
      <summary className="cursor-pointer font-mono text-xs tracking-[0.1em] text-muted-2">
        <span aria-hidden="true">{"// "}</span>tl;dr
      </summary>
      <ul className="mt-3.5 list-disc space-y-2 pl-4 text-sm leading-relaxed text-muted">
        {bullets.map((bullet) => (
          <li key={bullet}>{bullet}</li>
        ))}
      </ul>
    </details>
  );
}
