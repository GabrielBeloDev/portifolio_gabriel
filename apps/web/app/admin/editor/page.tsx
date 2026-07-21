import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { createDraft, listDrafts } from "@/lib/actions/drafts";
import type { DraftType } from "@/lib/draft-type";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "editor",
};

async function createAndOpenDraft(type: DraftType) {
  "use server";
  const result = await createDraft(type);
  if (!result.ok) redirect("/admin/editor");
  redirect(`/admin/editor/${result.data.id}`);
}

export default async function EditorListPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "admin") notFound();

  const drafts = await listDrafts();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-14 pb-16">
      <p className="font-mono text-sm tracking-wide text-faint"># drafts</p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-semibold">drafts</h1>
        <div className="flex items-center gap-2">
          <form action={createAndOpenDraft.bind(null, "post")}>
            <button
              type="submit"
              className="rounded-full border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              novo draft →
            </button>
          </form>
          <form action={createAndOpenDraft.bind(null, "study")}>
            <button
              type="submit"
              className="rounded-full border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent"
            >
              novo estudo →
            </button>
          </form>
        </div>
      </div>
      <div className="home-fade-up mt-8 overflow-hidden rounded-md border border-line bg-surface">
        <p className="flex items-center gap-1.5 border-b border-line bg-background-2 px-4 py-2 font-mono text-xs text-faint">
          <span aria-hidden>⌄</span>
          drafts/
        </p>
        {drafts.length === 0 ? (
          <p className="px-4 py-6 font-mono text-sm text-faint">
            // nenhum draft — comece um novo
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {drafts.map((item) => (
              <li key={item.id}>
                <Link
                  href={`/admin/editor/${item.id}`}
                  className="group flex items-baseline justify-between gap-4 px-4 py-3 transition-colors hover:bg-background-2"
                >
                  <span className="min-w-0 truncate font-medium transition-colors group-hover:text-accent">
                    <span aria-hidden className="mr-2 font-mono text-xs">
                      📝
                    </span>
                    {item.title || "(sem título)"}
                  </span>
                  <time
                    dateTime={item.updatedAt.toISOString()}
                    className="shrink-0 font-mono text-xs text-faint"
                  >
                    {formatDate(item.updatedAt.toISOString())}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
