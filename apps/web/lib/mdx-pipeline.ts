import type { PluggableList } from "unified";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import { remarkMermaid } from "./remark-mermaid";
import { amberInk } from "./shiki/amber-ink";
import { amberPaper } from "./shiki/amber-paper";

// Single source of truth for MDX rendering: velite (build) and the draft
// preview (runtime) must produce identical output. The draft flows still
// prepend remarkGfm on their own; applying GFM twice is a no-op.
export const remarkPlugins: PluggableList = [remarkGfm, remarkMermaid];

export const rehypePlugins: PluggableList = [
  rehypeSlug,
  [
    rehypePrettyCode,
    {
      theme: { light: amberPaper, dark: amberInk },
      keepBackground: false,
      defaultLang: "txt",
    },
  ],
];
