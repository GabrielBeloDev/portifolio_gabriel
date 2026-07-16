"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { Explorer, type ExplorerPost } from "./explorer";

export function MobileDrawer({ posts }: { posts: ExplorerPost[] }) {
  const [open, setOpen] = useState(false);
  const closeDrawer = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="abrir explorer"
          className="px-1 font-mono text-base text-muted transition-colors hover:text-foreground md:hidden"
        >
          ☰
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 w-[264px] border-r border-line bg-background-2 outline-none"
        >
          <Dialog.Title className="sr-only">explorer</Dialog.Title>
          <Explorer posts={posts} onNavigate={closeDrawer} className="h-full" />
          <Dialog.Close asChild>
            <button
              type="button"
              aria-label="fechar explorer"
              className="absolute top-3 right-3 font-mono text-sm text-muted transition-colors hover:text-foreground"
            >
              ×
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
