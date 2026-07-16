import { defineCollection, defineConfig, s } from "velite";
import { rehypePlugins, remarkPlugins } from "./lib/mdx-pipeline";

const posts = defineCollection({
  name: "Post",
  pattern: "posts/**/*.mdx",
  schema: s.object({
    title: s.string().max(120),
    date: s.isodate(),
    summary: s.string().max(300),
    tags: s.array(s.string()).default([]),
    draft: s.boolean().default(false),
    series: s
      .object({ name: s.string(), part: s.number().int().min(1) })
      .optional(),
    slug: s.path().transform((path) => path.replace(/^posts\//, "")),
    metadata: s.metadata(),
    // The outline renders h2/h3 only; cap the extraction to match
    toc: s.toc({ maxDepth: 3 }),
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
  // Referential integrity at build time: a case study pointing at a project
  // that was renamed or removed must fail loudly, not silently drop its link
  prepare: ({ projects, caseStudies }) => {
    const projectSlugs = new Set(projects.map((project) => project.slug));
    const orphans = caseStudies.filter(
      (study) => study.projectSlug && !projectSlugs.has(study.projectSlug),
    );
    if (orphans.length > 0) {
      const list = orphans
        .map((study) => `${study.slug} → ${study.projectSlug}`)
        .join(", ");
      throw new Error(`Case studies com projectSlug órfão: ${list}`);
    }
  },
  mdx: {
    remarkPlugins,
    rehypePlugins,
  },
});
