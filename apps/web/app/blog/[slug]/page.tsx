import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, ReadingProgress } from "@gabriel/ui";
import { CommentSection } from "@/components/comments/comment-section";
import { MDXContent } from "@/components/mdx";
import { findPost, publishedPosts } from "@/lib/content";
import { formatDate } from "@/lib/format";

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

  return (
    <div className="mx-auto max-w-3xl px-6">
      <div className="relative border-l border-line py-12 pl-6 sm:pl-10">
        <ReadingProgress className="-left-px" scrollContainerId="conteudo" />
        <article>
          <header>
            <p className="font-mono text-xs text-muted">
              <time dateTime={post.date.slice(0, 10)}>
                {formatDate(post.date)}
              </time>{" "}
              · {post.metadata.readingTime} min de leitura
            </p>
            <h1 className="mt-2 text-3xl leading-tight font-semibold">
              {post.title}
            </h1>
            <p className="mt-3 text-muted">{post.summary}</p>
            {post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <Badge key={tag}>{tag}</Badge>
                ))}
              </div>
            )}
          </header>
          <div className="prose mt-10">
            <MDXContent code={post.code} />
          </div>
        </article>
        <CommentSection postSlug={post.slug} />
        <footer className="mt-14">
          <Link
            href="/blog"
            className="font-mono text-xs text-accent transition-colors hover:underline"
          >
            ← todos os escritos
          </Link>
        </footer>
      </div>
    </div>
  );
}
