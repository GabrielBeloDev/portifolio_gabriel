"use server";

import { headers } from "next/headers";
import { and, comment, eq, like } from "@gabriel/db";
import { auth } from "@/lib/auth";
import { findPost } from "@/lib/content";
import { db } from "@/lib/db";
import { toggleLikeSchema } from "@/lib/validation/like";

type ToggleResult = { ok: true; liked: boolean } | { ok: false; error: string };

export async function toggleLike(input: unknown): Promise<ToggleResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return { ok: false, error: "entre para curtir" };

  const parsed = toggleLikeSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "dados inválidos" };
  }
  const { targetType, targetId, kind } = parsed.data;

  if (targetType === "post" && !findPost(targetId)) {
    return { ok: false, error: "post não encontrado" };
  }
  if (targetType === "comment") {
    const [target] = await db
      .select({ id: comment.id })
      .from(comment)
      .where(eq(comment.id, targetId))
      .limit(1);
    if (!target) return { ok: false, error: "comentário não encontrado" };
  }

  const removed = await db
    .delete(like)
    .where(
      and(
        eq(like.readerId, session.user.id),
        eq(like.targetType, targetType),
        eq(like.targetId, targetId),
        eq(like.kind, kind),
      ),
    )
    .returning({ id: like.id });

  if (removed.length > 0) {
    return { ok: true, liked: false };
  }

  // The unique constraint absorbs double-clicks racing past the delete check
  await db
    .insert(like)
    .values({ readerId: session.user.id, targetType, targetId, kind })
    .onConflictDoNothing();

  return { ok: true, liked: true };
}
