import { z } from "zod";

export const createCommentSchema = z.object({
  postSlug: z.string().min(1),
  parentId: z.uuid().optional(),
  body: z
    .string()
    .trim()
    .min(1, "escreva alguma coisa")
    .max(2000, "comentário longo demais (máx. 2000 caracteres)"),
});

export const deleteCommentSchema = z.object({
  id: z.uuid(),
});

export const reportCommentSchema = z.object({
  id: z.uuid(),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
