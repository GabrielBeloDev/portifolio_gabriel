import { z } from "zod";

export const saveDraftSchema = z.object({
  id: z.uuid(),
  title: z.string().max(300),
  slug: z.string().max(200),
  summary: z.string().max(1000),
  tags: z.string().max(300),
  body: z.string().max(100_000),
});

const KEBAB_SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

// Mirrors the velite Post schema: what a Draft must satisfy to become a Post
export const publishReadinessSchema = z.object({
  title: z.string().trim().min(1, "título vazio").max(120, "título > 120 caracteres"),
  slug: z
    .string()
    .regex(KEBAB_SLUG, "slug deve ser kebab-case (ex.: meu-post-novo)"),
  summary: z
    .string()
    .trim()
    .min(1, "resumo vazio")
    .max(300, "resumo > 300 caracteres"),
  body: z.string().trim().min(1, "corpo vazio"),
});

export function publishReadinessIssues(draft: {
  title: string;
  slug: string;
  summary: string;
  body: string;
}): string[] {
  const result = publishReadinessSchema.safeParse(draft);
  if (result.success) return [];
  return result.error.issues.map((issue) => issue.message);
}
