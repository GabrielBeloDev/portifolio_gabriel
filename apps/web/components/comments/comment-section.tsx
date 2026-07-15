"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { CommentNode } from "@/lib/comment-tree";
import { CommentForm } from "./comment-form";
import { CommentItem } from "./comment-item";

export type Viewer = { id: string; isAdmin: boolean } | null;

type CommentsPayload = {
  comments: CommentNode[];
  viewer: Viewer;
};

async function fetchComments(postSlug: string): Promise<CommentsPayload> {
  const response = await fetch(
    `/api/comments?post=${encodeURIComponent(postSlug)}`,
    { cache: "no-store" },
  );
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as CommentsPayload;
}

function countComments(nodes: CommentNode[]): number {
  return nodes.reduce(
    (total, node) => total + 1 + countComments(node.replies),
    0,
  );
}

export function CommentSection({ postSlug }: { postSlug: string }) {
  const [payload, setPayload] = useState<CommentsPayload | null>(null);
  const [failed, setFailed] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchComments(postSlug)
      .then((data) => {
        if (cancelled) return;
        setPayload(data);
        setFailed(false);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [postSlug, reloadKey]);

  const reload = () => setReloadKey((key) => key + 1);

  return (
    <section aria-label="comentários" className="mt-16 border-t border-line pt-8">
      <h2 className="font-mono text-sm font-medium tracking-widest text-muted uppercase">
        comentários{payload ? ` (${countComments(payload.comments)})` : ""}
      </h2>

      {failed && (
        <p className="mt-6 font-mono text-xs text-muted">
          não foi possível carregar os comentários.{" "}
          <button
            type="button"
            onClick={reload}
            className="text-accent hover:underline"
          >
            tentar de novo
          </button>
        </p>
      )}

      {!failed && payload === null && (
        <p role="status" className="mt-6 font-mono text-xs text-muted">
          carregando comentários…
        </p>
      )}

      {payload && (
        <>
          {payload.viewer ? (
            <div className="mt-6">
              <CommentForm postSlug={postSlug} onSubmitted={reload} />
            </div>
          ) : (
            <p className="mt-6 font-mono text-xs text-muted">
              <Link href="/entrar" className="text-accent hover:underline">
                entre
              </Link>{" "}
              para comentar e curtir.
            </p>
          )}

          {payload.comments.length === 0 ? (
            <p className="mt-8 font-mono text-xs text-muted">
              // ainda sem comentários — seja a primeira pessoa
            </p>
          ) : (
            <ul className="mt-8 flex flex-col gap-6">
              {payload.comments.map((node) => (
                <CommentItem
                  key={node.id}
                  node={node}
                  depth={0}
                  postSlug={postSlug}
                  viewer={payload.viewer}
                  onChanged={reload}
                />
              ))}
            </ul>
          )}
        </>
      )}
    </section>
  );
}
