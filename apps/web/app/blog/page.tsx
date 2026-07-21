import type { Metadata } from "next";
import { PostRow } from "@/components/post-row";
import { VirtualPostList } from "@/components/virtual-post-list";
import { publishedPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "blog",
  description: "Posts sobre o que estou construindo e estudando.",
};

// Below this the whole archive is server-rendered (best for SEO at small
// sizes); above it the list virtualizes on the client so a large archive stays
// cheap to render.
const VIRTUALIZE_THRESHOLD = 30;

export default function BlogPage() {
  const postCount = publishedPosts.length;
  const postCountLabel = postCount === 1 ? "1 post" : `${postCount} posts`;
  const shouldVirtualize = postCount > VIRTUALIZE_THRESHOLD;

  return (
    <div className="max-w-[900px] px-6 py-10 sm:px-[60px] sm:py-14">
      <p className="mb-2.5 font-mono text-sm text-muted-2">
        const posts = await getAll(
        <span className="text-ok">&apos;blog&apos;</span>)
      </p>
      <h1 className="font-display text-4xl leading-tight font-bold tracking-[-0.02em] sm:text-[46px]">
        Blog
      </h1>
      <p className="mt-1.5 mb-9 text-[17px] text-muted-2">
        Tudo que aprendi e achei que valia escrever.{" "}
        <span className="text-accent">{postCountLabel}</span>.
      </p>
      {postCount === 0 ? (
        <p className="font-mono text-sm text-muted">{"// nenhum post ainda"}</p>
      ) : shouldVirtualize ? (
        <VirtualPostList
          posts={publishedPosts.map((post) => ({
            slug: post.slug,
            title: post.title,
            date: post.date,
            summary: post.summary,
            tag: post.tags[0],
          }))}
        />
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {publishedPosts.map((post, position) => (
            <PostRow
              key={post.slug}
              href={`/blog/${post.slug}`}
              title={post.title}
              date={post.date}
              summary={post.summary}
              index={position + 1}
              tag={post.tags[0]}
              viewsSlug={post.slug}
              headingLevel="h2"
              revealDelay={position * 0.05}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
