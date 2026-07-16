import type { Metadata } from "next";
import { compile } from "@mdx-js/mdx";
import { notFound } from "next/navigation";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { draft, eq } from "@gabriel/db";
import { MDXContent } from "@/components/mdx";
import { db } from "@/lib/db";
import { rehypePlugins, remarkPlugins } from "@/lib/mdx-pipeline";

// The draft changes on every editor save, so this page can never be cached
export const dynamic = "force-dynamic";

// Public by design (the token is the secret), but never indexable
export const metadata: Metadata = {
  title: "rascunho",
  robots: { index: false, follow: false },
};

export default async function SharedDraftPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  // share_token is a uuid column: a malformed token must 404, not crash the query
  const parsedToken = z.uuid().safeParse(token);
  if (!parsedToken.success) notFound();

  const [shared] = await db
    .select()
    .from(draft)
    .where(eq(draft.shareToken, parsedToken.data))
    .limit(1);
  if (!shared) notFound();

  const compiled = await compile(shared.body, {
    outputFormat: "function-body",
    remarkPlugins: [remarkGfm, ...remarkPlugins],
    rehypePlugins,
  });

  return (
    <div className="mx-auto max-w-[720px] px-6 py-10 sm:py-14">
      <p className="rounded-sm border border-accent bg-accent-soft px-3 py-2 font-mono text-xs">
        rascunho não publicado — compartilhado para revisão
      </p>
      <article className="mt-10">
        {shared.title && (
          <h1 className="font-display text-4xl leading-[1.08] font-bold tracking-[-0.02em] sm:text-[44px]">
            {shared.title}
          </h1>
        )}
        {shared.summary && (
          <p className="mt-5 text-lg leading-[1.75] text-muted">
            {shared.summary}
          </p>
        )}
        <div className="prose mt-10">
          <MDXContent code={String(compiled)} />
        </div>
      </article>
    </div>
  );
}
