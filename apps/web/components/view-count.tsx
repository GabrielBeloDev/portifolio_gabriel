"use client";

import { useEffect, useState } from "react";

async function fetchViewCount(slug: string): Promise<number> {
  const response = await fetch(`/api/views/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const payload = (await response.json()) as { count: number };
  return payload.count;
}

const viewsLabel = (count: number) =>
  count === 1 ? "1 leitura" : `${count} leituras`;

export function ViewCount({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchViewCount(slug)
      .then((total) => {
        if (!cancelled) setCount(total);
      })
      .catch((error: unknown) => {
        // Counter is an enhancement: log loud, render nothing
        console.error("view count fetch failed", error);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  return (
    <span className="inline-block min-w-[12ch] font-mono">
      {count !== null && ` · ${viewsLabel(count)}`}
    </span>
  );
}
