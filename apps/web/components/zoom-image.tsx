"use client";

import { useState } from "react";

// Prose images come from markdown with unknown dimensions, so next/image
// (which requires width/height) doesn't apply here.
/* eslint-disable @next/next/no-img-element */
export function ZoomImage({ alt = "", ...props }: React.ComponentProps<"img">) {
  const [isOpen, setIsOpen] = useState(false);

  const closeOnBackdropClick = (event: React.MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) event.currentTarget.close();
  };

  const buttonLabel = alt ? `ampliar imagem ${alt}` : "ampliar imagem";

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={buttonLabel}
        className="block w-full cursor-zoom-in"
      >
        <img alt={alt} {...props} />
      </button>
      {isOpen && (
        <dialog
          ref={(node) => {
            node?.showModal();
          }}
          onClose={() => setIsOpen(false)}
          onClick={closeOnBackdropClick}
          className="m-auto max-h-[92dvh] max-w-[92vw] rounded-md border border-line bg-background p-2 backdrop:bg-black/75"
        >
          <img
            alt={alt}
            src={props.src}
            className="max-h-[calc(92dvh-1rem)] rounded-sm"
          />
        </dialog>
      )}
    </>
  );
}
