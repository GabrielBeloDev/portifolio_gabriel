import {
  and,
  asc,
  comment,
  count,
  eq,
  inArray,
  like,
  or,
  user,
} from "@gabriel/db";
import {
  buildCommentTree,
  type CommentNode,
  type LikeState,
} from "./comment-tree";
import { db } from "./db";

export type { CommentNode } from "./comment-tree";

export type CommentsPayload = {
  comments: CommentNode[];
  postLikes: LikeState;
};

export async function getCommentsPayload(
  postSlug: string,
  viewerId: string | null,
): Promise<CommentsPayload> {
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

  const commentIds = rows.map((row) => row.id);
  const targetConditions = [
    and(eq(like.targetType, "post"), eq(like.targetId, postSlug)),
  ];
  // drizzle's inArray rejects empty arrays, so the comment scope is conditional
  if (commentIds.length > 0) {
    targetConditions.push(
      and(eq(like.targetType, "comment"), inArray(like.targetId, commentIds)),
    );
  }
  const likeScope = or(...targetConditions);

  const [countRows, likedRows] = await Promise.all([
    db
      .select({
        targetType: like.targetType,
        targetId: like.targetId,
        total: count(),
      })
      .from(like)
      .where(likeScope)
      .groupBy(like.targetType, like.targetId),
    viewerId
      ? db
          .select({ targetType: like.targetType, targetId: like.targetId })
          .from(like)
          .where(and(eq(like.readerId, viewerId), likeScope))
      : Promise.resolve([]),
  ]);

  const commentCounts = new Map<string, number>();
  let postCount = 0;
  for (const row of countRows) {
    if (row.targetType === "post") {
      postCount = row.total;
    } else {
      commentCounts.set(row.targetId, row.total);
    }
  }

  const likedComments = new Set<string>();
  let postLiked = false;
  for (const row of likedRows) {
    if (row.targetType === "post") {
      postLiked = true;
    } else {
      likedComments.add(row.targetId);
    }
  }

  return {
    comments: buildCommentTree(rows, {
      counts: commentCounts,
      liked: likedComments,
    }),
    postLikes: { count: postCount, liked: postLiked },
  };
}
