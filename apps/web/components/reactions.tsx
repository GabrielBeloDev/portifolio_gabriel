"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { cn } from "@gabriel/ui";
import { toggleLike } from "@/lib/actions/likes";
import {
  postReactionKinds,
  type PostReactionKind,
  type PostReactionsState,
} from "@/lib/validation/like";

const REACTION_LABELS: Record<PostReactionKind, string> = {
  util: "útil",
  curioso: "curioso",
  discordo: "discordo",
};

type PostReactionsProps = {
  postSlug: string;
  initialReactions: PostReactionsState;
  signedIn: boolean;
};

export function PostReactions({
  postSlug,
  initialReactions,
  signedIn,
}: PostReactionsProps) {
  const [reactions, setReactions] = useState(initialReactions);
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();

  if (!signedIn) {
    return (
      <span className="inline-flex items-center gap-2 font-mono text-xs text-muted">
        {postReactionKinds.map((kind, index) => (
          <span key={kind} className="inline-flex items-center gap-2">
            {index > 0 && <span aria-hidden>·</span>}
            <Link
              href="/entrar"
              aria-label={`reagir ${REACTION_LABELS[kind]} (requer login)`}
              className="transition-colors hover:text-accent"
            >
              {REACTION_LABELS[kind]} ({reactions[kind].count})
            </Link>
          </span>
        ))}
      </span>
    );
  }

  function handleToggle(kind: PostReactionKind) {
    const previous = reactions;
    const current = reactions[kind];
    setFailed(false);
    setReactions({
      ...reactions,
      [kind]: {
        liked: !current.liked,
        count: current.count + (current.liked ? -1 : 1),
      },
    });

    startTransition(async () => {
      const result = await toggleLike({
        targetType: "post",
        targetId: postSlug,
        kind,
      });
      if (!result.ok) {
        setReactions(previous);
        setFailed(true);
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-2 font-mono text-xs">
      {postReactionKinds.map((kind, index) => (
        <span key={kind} className="inline-flex items-center gap-2">
          {index > 0 && (
            <span aria-hidden className="text-muted">
              ·
            </span>
          )}
          <button
            type="button"
            onClick={() => handleToggle(kind)}
            aria-label={`reagir ${REACTION_LABELS[kind]}`}
            aria-pressed={reactions[kind].liked}
            className={cn(
              "transition-colors",
              reactions[kind].liked
                ? "text-accent"
                : "text-muted hover:text-accent",
            )}
          >
            {REACTION_LABELS[kind]} ({reactions[kind].count})
          </button>
        </span>
      ))}
      {failed && (
        <span role="alert" className="text-danger">
          não foi possível reagir
        </span>
      )}
    </span>
  );
}
