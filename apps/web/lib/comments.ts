import { asc, comment, eq, user } from "@gabriel/db";
import { buildCommentTree, type CommentNode } from "./comment-tree";
import { db } from "./db";

export type { CommentNode } from "./comment-tree";

export async function getCommentTree(postSlug: string): Promise<CommentNode[]> {
  const rows = await db
    .select({
      id: comment.id,
      parentId: comment.parentId,
      authorId: comment.authorId,
      authorName: user.name,
      body: comment.body,
      createdAt: comment.createdAt,
      deletedAt: comment.deletedAt,
    })
    .from(comment)
    .innerJoin(user, eq(comment.authorId, user.id))
    .where(eq(comment.postSlug, postSlug))
    .orderBy(asc(comment.createdAt));

  return buildCommentTree(rows);
}
