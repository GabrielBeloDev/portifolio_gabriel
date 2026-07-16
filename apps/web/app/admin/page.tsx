import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { countReportedComments } from "@/lib/comments";

export const metadata: Metadata = {
  title: "admin",
};

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // notFound instead of redirect: non-admins get no hint this route exists
  if (session?.user.role !== "admin") {
    notFound();
  }

  const reportedCount = await countReportedComments();

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-14 pb-16">
      <p className="font-mono text-sm tracking-wide text-faint"># admin</p>
      <h1 className="mt-2 text-3xl font-semibold">admin</h1>
      <p className="mt-3 max-w-prose text-muted">Olá, {session.user.name}.</p>
      <div className="home-fade-up mt-8 overflow-hidden rounded-md border border-line bg-surface font-mono text-[13px]">
        <p className="flex items-center gap-1.5 border-b border-line bg-background-2 px-4 py-2 text-xs text-faint">
          <span aria-hidden>⌄</span>
          workspace
        </p>
        <Link
          href="/admin/editor"
          className="flex items-center gap-2 border-b border-line px-4 py-2.5 text-muted transition-colors hover:bg-background-2 hover:text-accent"
        >
          <span aria-hidden>📝</span> drafts &amp; editor →
        </Link>
        <Link
          href="/admin/comentarios"
          className="flex items-center gap-2 px-4 py-2.5 text-muted transition-colors hover:bg-background-2 hover:text-accent"
        >
          <span aria-hidden>💬</span> comentários →
          {reportedCount > 0 && (
            <span className="ml-auto rounded-full border border-danger px-2 py-0.5 text-[11px] text-danger">
              {reportedCount} reportado{reportedCount > 1 ? "s" : ""}
            </span>
          )}
        </Link>
      </div>
    </div>
  );
}
