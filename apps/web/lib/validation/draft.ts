import { z } from "zod";
import { DRAFT_TYPES, type DraftType } from "../draft-type";

export const saveDraftSchema = z.object({
  id: z.uuid(),
  type: z.enum(DRAFT_TYPES).default("post"),
  title: z.string().max(300),
  slug: z.string().max(200),
  summary: z.string().max(1000),
  tags: z.string().max(300),
  body: z.string().max(100_000),
  projectSlug: z.string().max(200).optional(),
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

export type DiagnosticSeverity = "error" | "warning";

export type PublishDiagnostic = {
  severity: DiagnosticSeverity;
  message: string;
};

type DraftDiagnosticsFields = {
  title: string;
  slug: string;
  summary: string;
  tags: string;
  body: string;
};

const HEADING_LINE = /^(#{1,6})\s+(.+)/;
const IMAGE_WITHOUT_ALT = /!\[\s*\]\(([^)\s]*)[^)]*\)/g;
const INTERNAL_POST_LINK = /\[[^\]]*\]\(\/blog\/([^)#?\s]+)[^)]*\)/g;
const CODE_FENCE = /^(?:`{3,}|~{3,})/;

// Headings, images and links inside fenced code blocks are examples, not content
function linesOutsideCodeFences(body: string): string[] {
  const contentLines: string[] = [];
  let insideFence = false;
  for (const line of body.split("\n")) {
    if (CODE_FENCE.test(line.trimStart())) {
      insideFence = !insideFence;
      continue;
    }
    if (!insideFence) contentLines.push(line);
  }
  return contentLines;
}

function missingTagsWarnings(tags: string): PublishDiagnostic[] {
  const tagList = tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  if (tagList.length > 0) return [];
  return [{ severity: "warning", message: "post sem tags" }];
}

function headingSkipWarnings(lines: string[]): PublishDiagnostic[] {
  const warnings: PublishDiagnostic[] = [];
  let previousLevel: number | null = null;
  for (const line of lines) {
    const heading = HEADING_LINE.exec(line);
    if (!heading) continue;
    const [, hashes = "", text = ""] = heading;
    const level = hashes.length;
    const skipsLevel = previousLevel !== null && level > previousLevel + 1;
    if (skipsLevel) {
      warnings.push({
        severity: "warning",
        message: `heading pula de h${previousLevel} para h${level}: "${text.trim()}"`,
      });
    }
    previousLevel = level;
  }
  return warnings;
}

function imageWithoutAltWarnings(lines: string[]): PublishDiagnostic[] {
  const warnings: PublishDiagnostic[] = [];
  for (const line of lines) {
    for (const image of line.matchAll(IMAGE_WITHOUT_ALT)) {
      warnings.push({
        severity: "warning",
        message: `imagem sem alt: ${image[1] ?? ""}`,
      });
    }
  }
  return warnings;
}

function brokenInternalLinkErrors(
  lines: string[],
  publishedSlugs: ReadonlySet<string>,
): PublishDiagnostic[] {
  const errors: PublishDiagnostic[] = [];
  for (const line of lines) {
    for (const link of line.matchAll(INTERNAL_POST_LINK)) {
      const slug = link[1] ?? "";
      if (slug === "" || publishedSlugs.has(slug)) continue;
      errors.push({
        severity: "error",
        message: `link interno quebrado: /blog/${slug}`,
      });
    }
  }
  return errors;
}

// The same problem repeated in the body should render as a single entry
function dedupeByMessage(diagnostics: PublishDiagnostic[]): PublishDiagnostic[] {
  const seen = new Set<string>();
  return diagnostics.filter((diagnostic) => {
    if (seen.has(diagnostic.message)) return false;
    seen.add(diagnostic.message);
    return true;
  });
}

export function publishDiagnostics(
  fields: DraftDiagnosticsFields,
  publishedSlugs: string[],
): PublishDiagnostic[] {
  const readinessErrors = publishReadinessIssues(fields).map(
    (message): PublishDiagnostic => ({ severity: "error", message }),
  );
  const lines = linesOutsideCodeFences(fields.body);
  return dedupeByMessage([
    ...readinessErrors,
    ...brokenInternalLinkErrors(lines, new Set(publishedSlugs)),
    ...missingTagsWarnings(fields.tags),
    ...headingSkipWarnings(lines),
    ...imageWithoutAltWarnings(lines),
  ]);
}

type StudyDiagnosticsFields = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  projectSlug?: string;
};

// A case study links to a project by slug; the velite prepare() step fails the
// build if that project does not exist, so we catch the orphan before the commit
function orphanProjectSlugErrors(
  projectSlug: string | undefined,
  projectSlugs: ReadonlySet<string>,
): PublishDiagnostic[] {
  const trimmed = projectSlug?.trim() ?? "";
  if (trimmed === "" || projectSlugs.has(trimmed)) return [];
  return [
    { severity: "error", message: `projeto vinculado inexistente ${trimmed}` },
  ];
}

export type DiagnosticsContext = {
  publishedPostSlugs: string[];
  projectSlugs: string[];
};

export function studyDiagnostics(
  fields: StudyDiagnosticsFields,
  ctx: DiagnosticsContext,
): PublishDiagnostic[] {
  const readinessErrors = publishReadinessIssues(fields).map(
    (message): PublishDiagnostic => ({ severity: "error", message }),
  );
  const lines = linesOutsideCodeFences(fields.body);
  return dedupeByMessage([
    ...readinessErrors,
    ...brokenInternalLinkErrors(lines, new Set(ctx.publishedPostSlugs)),
    ...orphanProjectSlugErrors(fields.projectSlug, new Set(ctx.projectSlugs)),
    ...headingSkipWarnings(lines),
    ...imageWithoutAltWarnings(lines),
  ]);
}

type DiagnosticsFields = DraftDiagnosticsFields & { projectSlug?: string };

export function diagnosticsFor(
  type: DraftType,
  fields: DiagnosticsFields,
  ctx: DiagnosticsContext,
): PublishDiagnostic[] {
  switch (type) {
    case "study":
      return studyDiagnostics(fields, ctx);
    // Project authoring lands its own checks in a follow-up (A2); until then it
    // shares the post diagnostics. The exhaustive switch flags this when it does
    case "post":
    case "project":
      return publishDiagnostics(fields, ctx.publishedPostSlugs);
  }
}
