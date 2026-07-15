import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { RuledPage, RuledSection } from "@gabriel/ui";
import { auth } from "@/lib/auth";
import { createDraft, listDrafts } from "@/lib/actions/drafts";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "editor",
};

async function createAndOpenDraft() {
  "use server";
  const result = await createDraft();
  if (!result.ok) redirect("/admin/editor");
  redirect(`/admin/editor/${result.data.id}`);
}

export default async function EditorListPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "admin") notFound();

  const drafts = await listDrafts();

  return (
    <RuledPage className="mx-auto max-w-3xl px-6 pb-16">
      <RuledSection>
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-3xl font-semibold">drafts</h1>
          <form action={createAndOpenDraft}>
            <button
              type="submit"
              className="rounded-sm border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              novo draft →
            </button>
          </form>
        </div>
        {drafts.length === 0 ? (
          <p className="mt-8 font-mono text-sm text-muted">
            // nenhum draft — comece um novo
          </p>
        ) : (
          <ul className="mt-8 divide-y divide-line">
            {drafts.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/editor/${item.id}`}
                  className="group flex items-baseline justify-between gap-4 py-3"
                >
                  <span className="font-medium transition-colors group-hover:text-accent">
                    {item.title || "(sem título)"}
                  </span>
                  <time
                    dateTime={item.updatedAt.toISOString()}
                    className="shrink-0 font-mono text-xs text-muted"
                  >
                    {formatDate(item.updatedAt.toISOString())}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </RuledSection>
    </RuledPage>
  );
}
