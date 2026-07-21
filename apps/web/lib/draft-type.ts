// The content collection a draft publishes to. Kept as a plain union in its own
// module so client components can import it without pulling in drizzle or zod.
export const DRAFT_TYPES = ["post", "study", "project"] as const;

export type DraftType = (typeof DRAFT_TYPES)[number];
