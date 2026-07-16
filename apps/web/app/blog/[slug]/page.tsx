import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@gabriel/ui";
import { CommentSection } from "@/components/comments/comment-section";
import { CONTENT_SCROLL_CONTAINER_ID } from "@/components/ide/ide-shell";
import { MDXContent } from "@/components/mdx";
import { findPost, publishedPosts } from "@/lib/content";
import { formatDate } from "@/lib/format";

type Post = (typeof publishedPosts)[number];

// Aesthetic fixed count like the mock; the absolute wrapper clips the list to
// the article height, so unused lines never extend the scroll area.
const GUTTER_LINE_COUNT = 200;
const gutterLines = Array.from({ length: GUTTER_LINE_COUNT }, (_, i) => i + 1);

function LineNumberGutter() {
  return (
    <div
      aria-hidden="true"
      className="relative hidden w-14 shrink-0 select-none md:block"
    >
      <div className="absolute inset-0 overflow-hidden py-14 text-right font-mono text-[12.5px] leading-loose text-faint/60">
        {gutterLines.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>
    </div>
  );
}

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
    <Link
      href={`/blog/${post.slug}`}
      className="rounded-[9px] bg-accent-fill px-5 py-3 font-mono text-sm font-bold text-on-accent transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-fill/40"
    >
      próximo: {shortPostTitle(post.title)} →
    </Link>
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
  return { title: post.title, description: post.summary };
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
    <div className="flex">
      <LineNumberGutter />
      <div className="relative min-w-0 max-w-[760px] flex-1 px-6 py-10 sm:px-[60px] sm:py-14">
        <ReadingProgress
          className="left-0"
          scrollContainerId={CONTENT_SCROLL_CONTAINER_ID}
        />
        <article>
          <header>
            <p className="font-mono text-[12.5px] text-muted-2">
              ---{" "}
              {primaryTag !== undefined && (
                <>
                  <span className="text-accent">{primaryTag}</span> ·{" "}
                </>
              )}
              <time dateTime={post.date.slice(0, 10)}>
                {formatDate(post.date)}
              </time>{" "}
              · {post.metadata.readingTime} min ---
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-[-0.02em] sm:text-[44px]">
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
          <Link
            href="/blog"
            className="rounded-[9px] border border-line px-5 py-3 font-mono text-sm text-muted transition-colors hover:bg-surface hover:text-foreground"
          >
            ← voltar ao blog
          </Link>
          <NextPostCta post={nextPost} />
        </footer>
        <CommentSection postSlug={post.slug} />
      </div>
    </div>
  );
}
