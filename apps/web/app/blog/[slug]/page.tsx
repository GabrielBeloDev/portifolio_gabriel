import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@gabriel/ui";
import { AdminEditLink } from "@/components/admin-edit-link";
import { CommentSection } from "@/components/comments/comment-section";
import { CtaLink } from "@/components/cta-link";
import { CONTENT_SCROLL_CONTAINER_ID } from "@/components/ide/ide-shell";
import { MDXContent } from "@/components/mdx";
import { PostHistory } from "@/components/post-history";
import { PostTldr } from "@/components/post-tldr";
import { PostToc } from "@/components/post-toc";
import { RelatedPosts } from "@/components/related-posts";
import { SeriesNav } from "@/components/series-nav";
import { ShareSelection } from "@/components/share-selection";
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
      próximo:{" "}
      <span className="inline-block max-w-[32ch] truncate align-bottom">
        {shortPostTitle(post.title)}
      </span>{" "}
      →
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
    <div className="relative mx-auto max-w-[720px] px-6 py-10 sm:py-14 xl:grid xl:max-w-[1080px] xl:grid-cols-[minmax(0,720px)_220px] xl:justify-center xl:gap-x-16">
      <ReadingProgress
        className="left-0"
        scrollContainerId={CONTENT_SCROLL_CONTAINER_ID}
      />
      <div className="min-w-0">
        <article>
          <header>
            <p className="text-sm text-muted-2">
              {primaryTag !== undefined && (
                <>
                  <Link
                    href={`/blog/tag/${primaryTag}`}
                    className="transition-colors hover:text-accent"
                  >
                    {primaryTag}
                  </Link>
                  {" · "}
                </>
              )}
              <time dateTime={post.date.slice(0, 10)}>
                {formatDateHuman(post.date)}
              </time>{" "}
              · {post.metadata.readingTime} min de leitura
              <ViewTracker slug={post.slug} />
              <AdminEditLink slug={post.slug} />
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.08] font-bold tracking-[-0.02em] sm:text-[44px]">
              {post.title}
            </h1>
            <p className="mt-5 text-lg leading-[1.75] text-muted">
              {post.summary}
            </p>
          </header>
          <SeriesNav post={post} />
          <PostTldr slug={post.slug} />
          <PostToc entries={post.toc} variant="details" />
          <ShareSelection>
            <div className="prose mt-10">
              <MDXContent code={post.code} />
            </div>
          </ShareSelection>
        </article>
        <footer className="mt-9 flex flex-wrap items-center gap-3 border-t border-line pt-6">
          <CtaLink href="/blog" variant="ghost">
            ← voltar ao blog
          </CtaLink>
          <NextPostCta post={nextPost} />
        </footer>
        <RelatedPosts post={post} />
        <PostHistory slug={post.slug} />
        <CommentSection postSlug={post.slug} />
      </div>
      <PostToc entries={post.toc} variant="aside" />
    </div>
  );
}
