// The content collection a draft publishes to. Kept as a plain union in its own
// module so client components can import it without pulling in drizzle or zod.
export const DRAFT_TYPES = ["post", "study", "project"] as const;

export type DraftType = (typeof DRAFT_TYPES)[number];

// A project is either coursework, a legacy study sandbox, or something that
// actually shipped. Slugs stay ascii; the label carries the accent for display.
export const PROJECT_CATEGORIES = [
  "faculdade",
  "legado-de-estudo",
  "producao",
] as const;

export type ProjectCategory = (typeof PROJECT_CATEGORIES)[number];

export const PROJECT_CATEGORY_LABELS: Record<ProjectCategory, string> = {
  faculdade: "faculdade",
  "legado-de-estudo": "legado de estudo",
  producao: "produção",
};
