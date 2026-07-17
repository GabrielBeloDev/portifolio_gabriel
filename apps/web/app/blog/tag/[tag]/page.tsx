import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostRow } from "@/components/post-row";
import { allTags, postsByTag } from "@/lib/content";

export function generateStaticParams() {
  return allTags().map((tag) => ({ tag }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  if (postsByTag(tag).length === 0) return {};
  return {
    title: `blog · ${tag}`,
    description: `Posts sobre ${tag}.`,
  };
}

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const posts = postsByTag(tag);
  if (posts.length === 0) notFound();

  const postCount = posts.length;
  const postCountLabel = postCount === 1 ? "1 post" : `${postCount} posts`;

  return (
    <div className="max-w-[900px] px-6 py-10 sm:px-[60px] sm:py-14">
      <p className="mb-2.5 font-mono text-sm text-muted-2">
        const posts = await getByTag(
        <span className="text-ok">&apos;{tag}&apos;</span>)
      </p>
      <h1 className="font-display text-4xl leading-tight font-bold tracking-[-0.02em] sm:text-[46px]">
        {tag}
      </h1>
      <p className="mt-1.5 mb-9 text-[17px] text-muted-2">
        Posts marcados com esta tag.{" "}
        <span className="text-accent">{postCountLabel}</span>.
      </p>
      <ul className="divide-y divide-line border-y border-line">
        {posts.map((post, position) => (
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
    </div>
  );
}
