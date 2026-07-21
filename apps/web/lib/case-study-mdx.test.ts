import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { caseStudyToMdx } from "./case-study-mdx";

const baseFields = {
  title: "Meu estudo",
  slug: "meu-estudo",
  summary: "Um resumo válido.",
  body: "## Seção\n\nconteúdo do estudo",
};

describe("caseStudyToMdx", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T15:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("generates frontmatter and body byte for byte without a project link", () => {
    expect(caseStudyToMdx(baseFields)).toBe(
      [
        "---",
        'title: "Meu estudo"',
        "date: 2026-07-16",
        'summary: "Um resumo válido."',
        "---",
        "",
        "## Seção",
        "",
        "conteúdo do estudo",
      ].join("\n"),
    );
  });

  it("includes projectSlug only when present", () => {
    expect(caseStudyToMdx({ ...baseFields, projectSlug: "este-site" })).toContain(
      'projectSlug: "este-site"',
    );
    expect(caseStudyToMdx({ ...baseFields, projectSlug: "   " })).not.toContain(
      "projectSlug",
    );
    expect(caseStudyToMdx(baseFields)).not.toContain("projectSlug");
  });

  it("never emits a tags line", () => {
    expect(caseStudyToMdx(baseFields)).not.toContain("tags");
  });

  it("escapes quotes in title and summary", () => {
    const mdx = caseStudyToMdx({
      ...baseFields,
      title: 'Estudo "com aspas"',
      summary: 'Resumo com "aspas" no meio',
    });
    expect(mdx).toContain('title: "Estudo \\"com aspas\\""');
    expect(mdx).toContain('summary: "Resumo com \\"aspas\\" no meio"');
  });
});
