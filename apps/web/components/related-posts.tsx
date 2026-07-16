import Link from "next/link";
import type { Post } from "#velite";
import { publishedPosts } from "@/lib/content";

const MAX_RELATED_POSTS = 3;

// publishedPosts is already sorted newest-first, so the slice keeps date order
function findRelatedPosts(post: Post) {
  return publishedPosts
    .filter((candidate) => candidate.slug !== post.slug)
    .filter((candidate) => candidate.tags.some((tag) => post.tags.includes(tag)))
    .slice(0, MAX_RELATED_POSTS);
}

export function RelatedPosts({ post }: { post: Post }) {
  const relatedPosts = findRelatedPosts(post);
  if (relatedPosts.length === 0) return null;

  return (
    <section className="mt-12">
      <p className="font-mono text-xs tracking-[0.1em] text-muted-2">
        {"// relacionados"}
      </p>
      <ul className="mt-3 divide-y divide-line border-y border-line">
        {relatedPosts.map((related) => (
          <li key={related.slug}>
            <Link
              href={`/blog/${related.slug}`}
              className="group block px-4 py-4 transition-colors hover:bg-surface"
            >
              {related.tags[0] !== undefined && (
                <span className="font-mono text-xs text-muted-2">
                  {related.tags[0]}
                </span>
              )}
              <span className="mt-1 block font-display text-lg font-semibold transition-colors group-hover:text-accent">
                {related.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
