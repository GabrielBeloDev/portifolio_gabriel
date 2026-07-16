"use client";

import { useState, useTransition } from "react";
import type { CommentNode } from "@/lib/comment-tree";
import { deleteComment } from "@/lib/actions/comments";
import { formatDate } from "@/lib/format";
import { CommentForm } from "./comment-form";
import type { Viewer } from "./comment-section";
import { LikeButton } from "./like-button";

// Beyond this depth the thread collapses behind "continuar thread →",
// otherwise mobile indentation squeezes text into a sliver (Reddit does the same)
const MAX_VISIBLE_DEPTH = 4;

type CommentItemProps = {
  node: CommentNode;
  depth: number;
  postSlug: string;
  viewer: Viewer;
  onChanged: () => void;
};

export function CommentItem({
  node,
  depth,
  postSlug,
  viewer,
  onChanged,
}: CommentItemProps) {
  const [replying, setReplying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, startDelete] = useTransition();

  const canDelete =
    !node.deleted && viewer !== null && (viewer.isAdmin || viewer.id === node.authorId);
  const hasHiddenReplies =
    depth >= MAX_VISIBLE_DEPTH && node.replies.length > 0 && !expanded;

  function handleDelete() {
    setError(null);
    startDelete(async () => {
      const result = await deleteComment({ id: node.id });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      onChanged();
    });
  }

  return (
    <li>
      <div className="flex items-baseline gap-3 font-mono text-xs">
        {node.deleted ? (
          <span className="text-muted italic">[removido]</span>
        ) : (
          <span className="font-medium">{node.authorName}</span>
        )}
        <time dateTime={node.createdAt} className="text-faint">
          {formatDate(node.createdAt)}
        </time>
        {!node.deleted && (
          <LikeButton
            key={`comment-${node.id}-${node.likes.count}-${node.likes.liked}`}
            targetType="comment"
            targetId={node.id}
            initialCount={node.likes.count}
            initialLiked={node.likes.liked}
            signedIn={viewer !== null}
          />
        )}
        {!node.deleted && viewer && (
          <button
            type="button"
            onClick={() => setReplying((current) => !current)}
            className="text-muted transition-colors hover:text-accent"
          >
            responder
          </button>
        )}
        {canDelete && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="text-muted transition-colors hover:text-accent disabled:opacity-50"
          >
            {deleting ? "apagando…" : "apagar"}
          </button>
        )}
      </div>

      {!node.deleted && (
        <p className="mt-1.5 text-sm leading-relaxed whitespace-pre-wrap">
          {node.body}
        </p>
      )}

      {error && (
        <p role="alert" className="mt-1 font-mono text-xs text-danger">
          {error}
        </p>
      )}

      {replying && (
        <div className="mt-3">
          <CommentForm
            postSlug={postSlug}
            parentId={node.id}
            autoFocus
            onSubmitted={() => {
              setReplying(false);
              onChanged();
            }}
          />
        </div>
      )}

      {node.replies.length > 0 && (
        <>
          {hasHiddenReplies ? (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="mt-3 font-mono text-xs text-accent transition-colors hover:underline"
            >
              continuar thread ({node.replies.length}) →
            </button>
          ) : (
            <ul className="mt-4 flex flex-col gap-5 border-l border-line pl-4 sm:pl-6">
              {node.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  node={reply}
                  depth={depth + 1}
                  postSlug={postSlug}
                  viewer={viewer}
                  onChanged={onChanged}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </li>
  );
}
