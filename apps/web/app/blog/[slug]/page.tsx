import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@gabriel/ui";
import { CommentSection } from "@/components/comments/comment-section";
import { CtaLink } from "@/components/cta-link";
import { CONTENT_SCROLL_CONTAINER_ID } from "@/components/ide/ide-shell";
import { MDXContent } from "@/components/mdx";
import { ViewTracker } from "@/components/view-tracker";
import { findPost, publishedPosts } from "@/lib/content";
import { formatDateHuman } from "@/lib/format";

type Post = (typeof publishedPosts)[number];

// Posts are sorted newest-first, so "next" is the next older post
function findNextPost(slug: string) {
  const currentIndex = publishedPosts.findIndex((post) => post.slug === slug);
  return publishedPosts[currentIndex + 1];
}

// Titles follow the "short name: subtitle" convention; the CTA only needs the short name
const shortPostTitle = (title: string) => title.split(":")[0] ?? title;

function NextPostCta({ post }: { post: Post | undefined }) {
  const hasNextPost = post !== undefined;
  if (!hasNextPost) return null;

  return (
    <CtaLink href={`/blog/${post.slug}`}>
      próximo: {shortPostTitle(post.title)} →
    </CtaLink>
  );
}

export function generateStaticParams() {
  return publishedPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: "article",
      publishedTime: post.date,
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = findPost(slug);
  if (!post) notFound();

  const nextPost = findNextPost(slug);
  const primaryTag = post.tags[0];

  return (
    <div className="relative mx-auto max-w-[720px] px-6 py-10 sm:py-14">
      <ReadingProgress
        className="left-0"
        scrollContainerId={CONTENT_SCROLL_CONTAINER_ID}
      />
      <article>
        <header>
          <p className="text-sm text-muted-2">
            {primaryTag !== undefined && <>{primaryTag} · </>}
            <time dateTime={post.date.slice(0, 10)}>
              {formatDateHuman(post.date)}
            </time>{" "}
            · {post.metadata.readingTime} min de leitura
            <ViewTracker slug={post.slug} />
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.08] font-bold tracking-[-0.02em] sm:text-[44px]">
            {post.title}
          </h1>
          <p className="mt-5 text-lg leading-[1.75] text-muted">
            {post.summary}
          </p>
        </header>
        <div className="prose mt-10">
          <MDXContent code={post.code} />
        </div>
      </article>
      <footer className="mt-9 flex flex-wrap items-center gap-3 border-t border-line pt-6">
        <CtaLink href="/blog" variant="ghost">
          ← voltar ao blog
        </CtaLink>
        <NextPostCta post={nextPost} />
      </footer>
      <CommentSection postSlug={post.slug} />
    </div>
  );
}
