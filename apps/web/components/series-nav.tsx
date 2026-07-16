import Link from "next/link";
import type { Post } from "#velite";
import { publishedPosts } from "@/lib/content";

export function SeriesNav({ post }: { post: Post }) {
  const series = post.series;
  if (!series) return null;

  const previousPart = series.part - 1;
  const nextPart = series.part + 1;
  const seriesPosts = publishedPosts.filter(
    (candidate) => candidate.series?.name === series.name,
  );
  const previousPost = seriesPosts.find(
    (candidate) => candidate.series?.part === previousPart,
  );
  const nextPost = seriesPosts.find(
    (candidate) => candidate.series?.part === nextPart,
  );

  return (
    <nav
      aria-label={`série ${series.name}`}
      className="mt-7 flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-md border border-line bg-surface px-4 py-3 font-mono text-xs"
    >
      <p className="text-muted-2">
        série <span className="text-accent">{series.name}</span> — parte{" "}
        {series.part} de {seriesPosts.length}
      </p>
      <p className="flex gap-5">
        {previousPost !== undefined && (
          <Link
            href={`/blog/${previousPost.slug}`}
            className="text-muted transition-colors hover:text-accent"
          >
            ← parte {previousPart}
          </Link>
        )}
        {nextPost !== undefined && (
          <Link
            href={`/blog/${nextPost.slug}`}
            className="text-muted transition-colors hover:text-accent"
          >
            parte {nextPart} →
          </Link>
        )}
      </p>
    </nav>
  );
}
