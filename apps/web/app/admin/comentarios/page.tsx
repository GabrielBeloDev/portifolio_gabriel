import type { Metadata } from "next";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deleteComment, dismissReport } from "@/lib/actions/comments";
import { auth } from "@/lib/auth";
import { listCommentsForModeration } from "@/lib/comments";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "comentários",
};

async function deleteCommentAction(formData: FormData) {
  "use server";
  const result = await deleteComment({ id: formData.get("id") });
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/admin/comentarios");
}

async function dismissReportAction(formData: FormData) {
  "use server";
  const result = await dismissReport({ id: formData.get("id") });
  if (!result.ok) throw new Error(result.error);
  revalidatePath("/admin/comentarios");
}

export default async function AdminCommentsPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // notFound instead of redirect: non-admins get no hint this route exists
  if (session?.user.role !== "admin") {
    notFound();
  }

  const comments = await listCommentsForModeration();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-14 pb-16">
      <p className="font-mono text-sm tracking-wide text-faint"># comentários</p>
      <h1 className="mt-2 text-3xl font-semibold">comentários</h1>
      <div className="mt-8 overflow-hidden rounded-md border border-line bg-surface">
        <p className="flex items-center gap-1.5 border-b border-line bg-background-2 px-4 py-2 font-mono text-xs text-faint">
          <span aria-hidden>⌄</span>
          moderação/
        </p>
        {comments.length === 0 ? (
          <p className="px-4 py-6 font-mono text-sm text-faint">
            {"// nenhum comentário ainda"}
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {comments.map((item) => (
              <li key={item.id} className="flex flex-col gap-2 px-4 py-3">
                <div className="flex flex-wrap items-baseline gap-3 font-mono text-xs">
                  <Link
                    href={`/blog/${item.postSlug}`}
                    className="text-link hover:underline"
                  >
                    /blog/{item.postSlug}
                  </Link>
                  <span className="font-medium">{item.authorName}</span>
                  <time
                    dateTime={item.createdAt.toISOString()}
                    className="text-faint"
                  >
                    {formatDate(item.createdAt.toISOString())}
                  </time>
                  {item.reportedAt && (
                    <span className="rounded-full border border-danger px-2 py-0.5 text-[11px] text-danger">
                      reportado
                    </span>
                  )}
                </div>
                <p className="line-clamp-3 text-sm leading-relaxed whitespace-pre-wrap">
                  {item.body}
                </p>
                <div className="flex items-center gap-3 font-mono text-xs">
                  <form action={deleteCommentAction}>
                    <input type="hidden" name="id" value={item.id} />
                    <button
                      type="submit"
                      className="text-muted transition-colors hover:text-accent"
                    >
                      apagar
                    </button>
                  </form>
                  {item.reportedAt && (
                    <form action={dismissReportAction}>
                      <input type="hidden" name="id" value={item.id} />
                      <button
                        type="submit"
                        className="text-muted transition-colors hover:text-accent"
                      >
                        ignorar report
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
