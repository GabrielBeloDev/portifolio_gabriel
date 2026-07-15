import type { PluggableList } from "unified";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { remarkMermaid } from "./remark-mermaid";
import { amberInk } from "./shiki/amber-ink";
import { amberPaper } from "./shiki/amber-paper";

// Single source of truth for MDX rendering: velite (build) and the draft
// preview (runtime) must produce identical output
export const remarkPlugins: PluggableList = [remarkMermaid];

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
