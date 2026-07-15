import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { defineCollection, defineConfig, s } from "velite";
import { remarkMermaid } from "./lib/remark-mermaid";
import { amberInk } from "./lib/shiki/amber-ink";
import { amberPaper } from "./lib/shiki/amber-paper";

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s.object({
    title: s.string().max(120),
    date: s.isodate(),
    summary: s.string().max(300),
    tags: s.array(s.string()).default([]),
    draft: s.boolean().default(false),
    slug: s.path().transform((path) => path.replace(/^posts\//, "")),
    metadata: s.metadata(),
    code: s.mdx(),
  }),
});

const projects = defineCollection({
  name: "Project",
  pattern: "projects/**/*.yml",
  schema: s.object({
    title: s.string().max(80),
    summary: s.string().max(200),
    stack: s.array(s.string()),
    repo: s.string().url().optional(),
    live: s.string().url().optional(),
    order: s.number().default(0),
    slug: s.path().transform((path) => path.replace(/^projects\//, "")),
  }),
});

const caseStudies = defineCollection({
  name: "CaseStudy",
  pattern: "case-studies/**/*.mdx",
  schema: s.object({
    title: s.string().max(120),
    date: s.isodate(),
    summary: s.string().max(300),
    // Optional pointer to a Project (CONTEXT.md: a Case Study can stand alone)
    projectSlug: s.string().optional(),
    draft: s.boolean().default(false),
    slug: s.path().transform((path) => path.replace(/^case-studies\//, "")),
    metadata: s.metadata(),
    code: s.mdx(),
  }),
});

export default defineConfig({
  root: "content",
  collections: { posts, projects, caseStudies },
  mdx: {
    remarkPlugins: [remarkMermaid],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: { light: amberPaper, dark: amberInk },
          keepBackground: false,
          defaultLang: "txt",
        },
      ],
    ],
  },
});
