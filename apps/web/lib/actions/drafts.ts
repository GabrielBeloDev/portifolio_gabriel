"use server";

import { compile } from "@mdx-js/mdx";
import { and, draft, desc, eq } from "@gabriel/db";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import remarkGfm from "remark-gfm";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { caseStudyToMdx } from "@/lib/case-study-mdx";
import {
  allProjects,
  findCaseStudy,
  findPost,
  publishedPosts,
} from "@/lib/content";
import { db } from "@/lib/db";
import { type DraftType, toProjectCategory } from "@/lib/draft-type";
import { draftToMdx } from "@/lib/draft-mdx";
import { projectToYaml } from "@/lib/project-yaml";
import { commitContentFile, contentPath } from "@/lib/github-commit";
import { rehypePlugins, remarkPlugins } from "@/lib/mdx-pipeline";
import { diagnosticsFor, saveDraftSchema } from "@/lib/validation/draft";

type PublishFields = {
  title: string;
  slug: string;
  summary: string;
  tags: string;
  body: string;
  projectSlug?: string;
  repo?: string;
  live?: string;
  category?: string;
};

function publishFileFor(
  type: DraftType,
  fields: PublishFields,
): { content: string; message: string } {
  switch (type) {
    case "study":
      return {
        content: caseStudyToMdx(fields),
        message: `content: publish case study ${fields.slug}`,
      };
    case "project": {
      // New projects append after the last one. An untouched category is empty,
      // which the narrow turns into the same default velite would apply
      const order =
        allProjects.reduce((max, project) => Math.max(max, project.order), 0) +
        1;
      return {
        content: projectToYaml({
          title: fields.title,
          summary: fields.summary,
          stack: fields.tags
            .split(",")
            .map((tech) => tech.trim())
            .filter(Boolean),
          category: toProjectCategory(fields.category) ?? "producao",
          repo: fields.repo,
          live: fields.live,
          order,
        }),
        message: `content: publish project ${fields.slug}`,
      };
    }
    case "post":
      return {
        content: draftToMdx(fields),
        message: `content: publish ${fields.slug}`,
      };
  }
}

type ActionResult<T = undefined> =
  { ok: true; data: T } | { ok: false; error: string };

async function getAdmin() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (session?.user.role !== "admin") return null;
  return session.user;
}

export async function createDraft(
  type: DraftType = "post",
): Promise<ActionResult<{ id: string }>> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "sem permissão" };

  const [created] = await db
    .insert(draft)
    .values({ authorId: admin.id, type })
    .returning({ id: draft.id });
  if (!created) return { ok: false, error: "não foi possível criar o draft" };

  return { ok: true, data: { id: created.id } };
}

export async function createDraftFromPost(
  input: unknown,
): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "sem permissão" };

  const parsed = z.object({ slug: z.string() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "dados inválidos" };

  const post = findPost(parsed.data.slug);
  if (!post) return { ok: false, error: "post não encontrado" };

  const [created] = await db
    .insert(draft)
    .values({
      authorId: admin.id,
      type: "post",
      title: post.title,
      slug: post.slug,
      summary: post.summary,
      tags: post.tags.join(", "),
      body: post.raw,
    })
    .returning({ id: draft.id });
  if (!created) return { ok: false, error: "não foi possível criar o draft" };

  redirect(`/admin/editor/${created.id}`);
}

export async function createDraftFromCaseStudy(
  input: unknown,
): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "sem permissão" };

  const parsed = z.object({ slug: z.string() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "dados inválidos" };

  const study = findCaseStudy(parsed.data.slug);
  if (!study) return { ok: false, error: "estudo não encontrado" };

  const [created] = await db
    .insert(draft)
    .values({
      authorId: admin.id,
      type: "study",
      title: study.title,
      slug: study.slug,
      summary: study.summary,
      body: study.raw,
      projectSlug: study.projectSlug ?? null,
    })
    .returning({ id: draft.id });
  if (!created) return { ok: false, error: "não foi possível criar o draft" };

  redirect(`/admin/editor/${created.id}`);
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

export async function publishDraft(
  input: unknown,
): Promise<ActionResult<{ commitUrl: string }>> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "sem permissão" };

  const parsed = z.object({ id: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "dados inválidos" };

  const [current] = await db
    .select()
    .from(draft)
    .where(and(eq(draft.id, parsed.data.id), eq(draft.authorId, admin.id)))
    .limit(1);
  if (!current) return { ok: false, error: "draft não encontrado" };

  const fields = {
    title: current.title,
    slug: current.slug,
    summary: current.summary,
    tags: current.tags,
    body: current.body,
    projectSlug: current.projectSlug ?? undefined,
    repo: current.repo ?? undefined,
    live: current.live ?? undefined,
    category: current.category ?? undefined,
  };

  const blockingErrors = diagnosticsFor(current.type, fields, {
    publishedPostSlugs: publishedPosts.map((post) => post.slug),
    projectSlugs: allProjects.map((project) => project.slug),
  })
    .filter((diagnostic) => diagnostic.severity === "error")
    .map((diagnostic) => diagnostic.message);
  if (blockingErrors.length > 0) {
    return { ok: false, error: blockingErrors.join("; ") };
  }

  const file = publishFileFor(current.type, fields);
  const { commitUrl } = await commitContentFile({
    path: contentPath(current.type, fields.slug),
    content: file.content,
    message: file.message,
  });

  return { ok: true, data: { commitUrl } };
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

export async function generateShareToken(
  input: unknown,
): Promise<ActionResult<{ shareToken: string }>> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "sem permissão" };

  const parsed = z.object({ id: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "dados inválidos" };

  const shareToken = crypto.randomUUID();
  const updated = await db
    .update(draft)
    .set({ shareToken })
    .where(and(eq(draft.id, parsed.data.id), eq(draft.authorId, admin.id)))
    .returning({ id: draft.id });
  if (updated.length === 0) {
    return { ok: false, error: "draft não encontrado" };
  }

  return { ok: true, data: { shareToken } };
}

export async function revokeShareToken(input: unknown): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: "sem permissão" };

  const parsed = z.object({ id: z.uuid() }).safeParse(input);
  if (!parsed.success) return { ok: false, error: "dados inválidos" };

  const updated = await db
    .update(draft)
    .set({ shareToken: null })
    .where(and(eq(draft.id, parsed.data.id), eq(draft.authorId, admin.id)))
    .returning({ id: draft.id });
  if (updated.length === 0) {
    return { ok: false, error: "draft não encontrado" };
  }

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
