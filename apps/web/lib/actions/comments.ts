"use server";

import { headers } from "next/headers";
import { and, comment, eq, gte } from "@gabriel/db";
import { auth } from "@/lib/auth";
import { findPost } from "@/lib/content";
import { db } from "@/lib/db";
import {
  createCommentSchema,
  deleteCommentSchema,
} from "@/lib/validation/comment";

type ActionResult = { ok: true } | { ok: false; error: string };

const COMMENT_COOLDOWN_MS = 15_000;

async function getViewer() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return session.user;
}

export async function createComment(input: unknown): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "entre para comentar" };

  const parsed = createCommentSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "dados inválidos",
    };
  }
  const { postSlug, parentId, body } = parsed.data;

  // Posts live in git, comments in Postgres — the write boundary is where the
  // cross-store reference gets validated
  if (!findPost(postSlug)) {
    return { ok: false, error: "post não encontrado" };
  }

  if (parentId) {
    const [parent] = await db
      .select({ id: comment.id, deletedAt: comment.deletedAt })
      .from(comment)
      .where(and(eq(comment.id, parentId), eq(comment.postSlug, postSlug)))
      .limit(1);
    if (!parent) {
      return { ok: false, error: "comentário respondido não existe mais" };
    }
  }

  const cooldownStart = new Date(Date.now() - COMMENT_COOLDOWN_MS);
  const [recent] = await db
    .select({ id: comment.id })
    .from(comment)
    .where(
      and(
        eq(comment.authorId, viewer.id),
        gte(comment.createdAt, cooldownStart),
      ),
    )
    .limit(1);
  if (recent) {
    return { ok: false, error: "calma — espere alguns segundos entre comentários" };
  }

  await db.insert(comment).values({
    postSlug,
    parentId: parentId ?? null,
    authorId: viewer.id,
    body,
  });

  return { ok: true };
}

export async function deleteComment(input: unknown): Promise<ActionResult> {
  const viewer = await getViewer();
  if (!viewer) return { ok: false, error: "entre para gerenciar comentários" };

  const parsed = deleteCommentSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "dados inválidos" };
  }

  const [target] = await db
    .select({ id: comment.id, authorId: comment.authorId })
    .from(comment)
    .where(eq(comment.id, parsed.data.id))
    .limit(1);
  if (!target) {
    return { ok: false, error: "comentário não encontrado" };
  }

  const canDelete = viewer.role === "admin" || target.authorId === viewer.id;
  if (!canDelete) {
    return { ok: false, error: "sem permissão para apagar este comentário" };
  }

  // Soft delete keeps the subtree attached (CONTEXT.md: Comment)
  await db
    .update(comment)
    .set({ deletedAt: new Date() })
    .where(eq(comment.id, parsed.data.id));

  return { ok: true };
}
