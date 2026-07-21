export type TextEdit = {
  value: string;
  selectionStart: number;
  selectionEnd: number;
};

// Caret offset past the "![" opener so it lands inside the empty alt brackets
const ALT_CARET_OFFSET = "![".length;

// A unique token per upload keeps concurrent pastes from colliding when their
// placeholders resolve — indexOf would otherwise match the wrong marker
export function imageUploadPlaceholder(token: string): string {
  return `![enviando imagem ${token}…]()`;
}

export function imageMarkdown(url: string): string {
  return `![](${url})`;
}

export function insertText(
  value: string,
  selectionStart: number,
  selectionEnd: number,
  insertion: string,
): TextEdit {
  const before = value.slice(0, selectionStart);
  const after = value.slice(selectionEnd);
  const caret = selectionStart + insertion.length;
  return {
    value: `${before}${insertion}${after}`,
    selectionStart: caret,
    selectionEnd: caret,
  };
}

// Swaps the placeholder for the final image markdown and drops the caret inside
// the empty alt so the author can type the description right away
export function resolveImagePlaceholder(
  value: string,
  placeholder: string,
  url: string,
): TextEdit | null {
  const start = value.indexOf(placeholder);
  // Author may have deleted the placeholder mid-upload; a missing marker is a no-op
  if (start === -1) return null;
  const before = value.slice(0, start);
  const after = value.slice(start + placeholder.length);
  const caret = start + ALT_CARET_OFFSET;
  return {
    value: `${before}${imageMarkdown(url)}${after}`,
    selectionStart: caret,
    selectionEnd: caret,
  };
}

// Drops the placeholder entirely when an upload fails, leaving the caret where
// the marker had been
export function removeImagePlaceholder(
  value: string,
  placeholder: string,
): TextEdit | null {
  const start = value.indexOf(placeholder);
  if (start === -1) return null;
  const before = value.slice(0, start);
  const after = value.slice(start + placeholder.length);
  return { value: `${before}${after}`, selectionStart: start, selectionEnd: start };
}
