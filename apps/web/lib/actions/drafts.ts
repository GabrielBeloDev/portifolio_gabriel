"use server";

import { compile } from "@mdx-js/mdx";
import { and, draft, desc, eq } from "@gabriel/db";
import { headers } from "next/headers";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rehypePlugins, remarkPlugins } from "@/lib/mdx-pipeline";
import { saveDraftSchema } from "@/lib/validation/draft";

type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string };

async function getAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "admin") return null;
  return session.user;
}

export async function createDraft(): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "sem permissão" };

  const [created] = await db
    .insert(draft)
    .values({ authorId: admin.id })
    .returning({ id: draft.id });
  if (!created) return { ok: false, error: "não foi possível criar o draft" };

  return { ok: true, data: { id: created.id } };
}

export async function saveDraft(input: unknown): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "sem permissão" };

  const parsed = saveDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "dados inválidos",
    };
  }
  const { id, ...fields } = parsed.data;

  const updated = await db
    .update(draft)
    .set({ ...fields, updatedAt: new Date() })
    .where(and(eq(draft.id, id), eq(draft.authorId, admin.id)))
    .returning({ id: draft.id });
  if (updated.length === 0) {
    return { ok: false, error: "draft não encontrado" };
  }

  return { ok: true, data: undefined };
}

export async function deleteDraft(input: unknown): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "sem permissão" };

  const parsed = z.object({ id: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "dados inválidos" };

  await db
    .delete(draft)
    .where(and(eq(draft.id, parsed.data.id), eq(draft.authorId, admin.id)));

  return { ok: true, data: undefined };
}

export async function previewDraft(
  input: unknown,
): Promise<ActionResult<{ code: string }>> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "sem permissão" };

  const parsed = z.object({ body: z.string().max(100_000) }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "dados inválidos" };

  try {
    const compiled = await compile(parsed.data.body, {
      outputFormat: "function-body",
      remarkPlugins: [remarkGfm, ...remarkPlugins],
      rehypePlugins,
    });
    return { ok: true, data: { code: String(compiled) } };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "erro ao compilar o MDX";
    return { ok: false, error: message };
  }
}

export async function listDrafts() {
  const admin = await getAdmin();
  if (!admin) return [];

  return db
    .select({
      id: draft.id,
      title: draft.title,
      updatedAt: draft.updatedAt,
    })
    .from(draft)
    .where(eq(draft.authorId, admin.id))
    .orderBy(desc(draft.updatedAt));
}
