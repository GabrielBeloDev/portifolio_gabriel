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

// Narrow an untrusted string (DB column, form field) to a category, or null.
// The only cast lives here, right after a membership check, so callers never
// assert a raw string is a ProjectCategory.
export function toProjectCategory(
  value: string | null | undefined,
): ProjectCategory | null {
  const trimmed = value?.trim() ?? "";
  const categories: readonly string[] = PROJECT_CATEGORIES;
  return categories.includes(trimmed) ? (trimmed as ProjectCategory) : null;
}
