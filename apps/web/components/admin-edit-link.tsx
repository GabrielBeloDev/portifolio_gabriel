"use client";

import { useTransition } from "react";
import {
  createDraftFromCaseStudy,
  createDraftFromPost,
} from "@/lib/actions/drafts";
import { authClient } from "@/lib/auth-client";

export function AdminEditLink({
  slug,
  kind = "post",
}: {
  slug: string;
  kind?: "post" | "study";
}) {
  const { data: session } = authClient.useSession();
  const [isPending, startTransition] = useTransition();

  const isAdmin = session?.user.role === "admin";
  if (!isAdmin) return null;

  function handleEdit() {
    startTransition(async () => {
      // On success the action redirects and never resolves with a value
      const createDraftFrom =
        kind === "study" ? createDraftFromCaseStudy : createDraftFromPost;
      const result = await createDraftFrom({ slug });
      if (result?.ok === false) {
        console.error("createDraftFrom failed", result.error);
      }
    });
  }

  return (
    <>
      {" · "}
      <button
        type="button"
        onClick={handleEdit}
        disabled={isPending}
        className="font-mono text-muted-2 transition-colors hover:text-accent"
      >
        {isPending ? "abrindo…" : "editar"}
      </button>
    </>
  );
}
