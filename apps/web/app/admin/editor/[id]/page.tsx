import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { and, draft, eq } from "@gabriel/db";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { DraftEditor } from "@/components/editor/draft-editor";

export const metadata: Metadata = {
  title: "editor",
};

export default async function DraftEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "admin") notFound();

  const { id } = await params;
  const [current] = await db
    .select()
    .from(draft)
    .where(and(eq(draft.id, id), eq(draft.authorId, session.user.id)))
    .limit(1);
  if (!current) notFound();

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <DraftEditor
        draft={{
          id: current.id,
          title: current.title,
          slug: current.slug,
          summary: current.summary,
          tags: current.tags,
          body: current.body,
        }}
      />
    </div>
  );
}
