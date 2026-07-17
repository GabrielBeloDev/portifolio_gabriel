import {
  and,
  asc,
  comment,
  count,
  desc,
  eq,
  inArray,
  isNotNull,
  isNull,
  like,
  or,
  sql,
  user,
} from "@gabriel/db";
import {
  buildCommentTree,
  type CommentNode,
  type LikeState,
} from "./comment-tree";
import { db } from "./db";
import {
  postReactionKinds,
  type PostReactionKind,
  type PostReactionsState,
} from "./validation/like";

export type { CommentNode } from "./comment-tree";

export type CommentsPayload = {
  comments: CommentNode[];
  postLikes: LikeState;
  postReactions: PostReactionsState;
};

function isPostReactionKind(kind: string): kind is PostReactionKind {
  return (postReactionKinds as readonly string[]).includes(kind);
}

export type ModerationComment = {
  id: string;
  postSlug: string;
  authorName: string;
  body: string;
  createdAt: Date;
  reportedAt: Date | null;
};

export async function listCommentsForModeration(): Promise<ModerationComment[]> {
  return db
    .select({
      id: comment.id,
      postSlug: comment.postSlug,
      authorName: user.name,
      body: comment.body,
      createdAt: comment.createdAt,
      reportedAt: comment.reportedAt,
    })
    .from(comment)
    .innerJoin(user, eq(comment.authorId, user.id))
    .where(isNull(comment.deletedAt))
    .orderBy(sql`${comment.reportedAt} DESC NULLS LAST`, desc(comment.createdAt));
}

export async function countReportedComments(): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(comment)
    .where(and(isNotNull(comment.reportedAt), isNull(comment.deletedAt)));
  return row?.total ?? 0;
}

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
        kind: like.kind,
        total: count(),
      })
      .from(like)
      .where(likeScope)
      .groupBy(like.targetType, like.targetId, like.kind),
    viewerId
      ? db
          .select({
            targetType: like.targetType,
            targetId: like.targetId,
            kind: like.kind,
          })
          .from(like)
          .where(and(eq(like.readerId, viewerId), likeScope))
      : Promise.resolve([]),
  ]);

  const postReactions: PostReactionsState = {
    util: { count: 0, liked: false },
    curioso: { count: 0, liked: false },
    discordo: { count: 0, liked: false },
  };

  const commentCounts = new Map<string, number>();
  let postCount = 0;
  for (const row of countRows) {
    if (row.targetType === "post") {
      if (row.kind === "like") {
        postCount = row.total;
      } else if (isPostReactionKind(row.kind)) {
        postReactions[row.kind].count = row.total;
      }
    } else if (row.kind === "like") {
      commentCounts.set(row.targetId, row.total);
    }
  }

  const likedComments = new Set<string>();
  let postLiked = false;
  for (const row of likedRows) {
    if (row.targetType === "post") {
      if (row.kind === "like") {
        postLiked = true;
      } else if (isPostReactionKind(row.kind)) {
        postReactions[row.kind].liked = true;
      }
    } else if (row.kind === "like") {
      likedComments.add(row.targetId);
    }
  }

  return {
    comments: buildCommentTree(rows, {
      counts: commentCounts,
      liked: likedComments,
    }),
    postLikes: { count: postCount, liked: postLiked },
    postReactions,
  };
}
