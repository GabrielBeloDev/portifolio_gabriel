"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteDraft } from "@/lib/actions/drafts";

export function DeleteDraftButton({ draftId }: { draftId: string }) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function clearErrorOnClose(open: boolean) {
    if (!open) setError(null);
  }

  function handleConfirm() {
    startTransition(async () => {
      const result = await deleteDraft({ id: draftId });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push("/admin/editor");
    });
  }

  return (
    <Dialog.Root onOpenChange={clearErrorOnClose}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="font-mono text-xs text-danger transition-colors hover:underline"
        >
          apagar draft
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(90vw,380px)] -translate-x-1/2 -translate-y-1/2 rounded-md border border-line bg-surface p-5 outline-none">
          <Dialog.Title className="text-base font-semibold">
            apagar draft?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm text-muted">
            esta ação não tem volta — o texto será perdido.
          </Dialog.Description>
          {error !== null && (
            <p role="alert" className="mt-2 font-mono text-xs text-danger">
              {error}
            </p>
          )}
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded-sm border border-line bg-background-2 px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-accent"
              >
                cancelar
              </button>
            </Dialog.Close>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isPending}
              className="rounded-sm border border-line bg-surface px-3 py-1.5 font-mono text-xs text-danger transition-colors hover:border-danger disabled:opacity-60"
            >
              {isPending ? "apagando…" : "sim, apagar"}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
