"use client";

import { useState, useTransition } from "react";
import { Button } from "@gabriel/ui";
import { createComment } from "@/lib/actions/comments";
import { createCommentSchema } from "@/lib/validation/comment";

type CommentFormProps = {
  postSlug: string;
  parentId?: string;
  autoFocus?: boolean;
  onSubmitted: () => void;
};

export function CommentForm({
  postSlug,
  parentId,
  autoFocus = false,
  onSubmitted,
}: CommentFormProps) {
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = createCommentSchema.safeParse({ postSlug, parentId, body });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "dados inválidos");
      return;
    }

    startTransition(async () => {
      const result = await createComment(parsed.data);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setBody("");
      onSubmitted();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor={`comment-${parentId ?? "root"}`} className="sr-only">
        {parentId ? "sua resposta" : "seu comentário"}
      </label>
      <textarea
        id={`comment-${parentId ?? "root"}`}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        rows={3}
        autoFocus={autoFocus}
        placeholder={parentId ? "sua resposta…" : "seu comentário…"}
        className="w-full resize-y rounded-sm border border-line bg-surface px-3 py-2 text-sm transition-colors focus:border-accent"
      />
      {error && (
        <p role="alert" className="font-mono text-xs text-danger">
          {error}
        </p>
      )}
      <div>
        <Button
          type="submit"
          size="sm"
          variant="solid"
          disabled={pending}
          className="rounded-full bg-accent-fill font-sans font-medium text-on-accent"
        >
          {pending ? "enviando…" : parentId ? "responder" : "comentar"}
        </Button>
      </div>
    </form>
  );
}
