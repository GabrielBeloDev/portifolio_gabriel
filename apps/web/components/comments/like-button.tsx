"use client";

import { Heart } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { cn } from "@gabriel/ui";
import { toggleLike } from "@/lib/actions/likes";

type LikeButtonProps = {
  targetType: "post" | "comment";
  targetId: string;
  initialCount: number;
  initialLiked: boolean;
  signedIn: boolean;
};

export function LikeButton({
  targetType,
  targetId,
  initialCount,
  initialLiked,
  signedIn,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const [failed, setFailed] = useState(false);
  const [, startTransition] = useTransition();

  const label = targetType === "post" ? "curtir post" : "curtir comentário";

  if (!signedIn) {
    return (
      <Link
        href="/entrar"
        aria-label={`${label} (requer login)`}
        className="inline-flex items-center gap-1 font-mono text-xs text-muted transition-colors hover:text-danger"
      >
        <Heart aria-hidden className="size-3.5" />
        {likeCount}
      </Link>
    );
  }

  function handleToggle() {
    const previous = { liked, likeCount };
    const nextLiked = !liked;
    setFailed(false);
    setLiked(nextLiked);
    setLikeCount((current) => current + (nextLiked ? 1 : -1));

    startTransition(async () => {
      const result = await toggleLike({ targetType, targetId });
      if (!result.ok) {
        setLiked(previous.liked);
        setLikeCount(previous.likeCount);
        setFailed(true);
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button
        type="button"
        onClick={handleToggle}
        aria-label={label}
        aria-pressed={liked}
        className={cn(
          "inline-flex items-center gap-1 font-mono text-xs transition-colors",
          liked ? "text-danger" : "text-muted hover:text-danger",
        )}
      >
        <Heart
          aria-hidden
          className="size-3.5"
          fill={liked ? "currentColor" : "none"}
        />
        {likeCount}
      </button>
      {failed && (
        <span role="alert" className="font-mono text-xs text-danger">
          não foi possível curtir
        </span>
      )}
    </span>
  );
}
