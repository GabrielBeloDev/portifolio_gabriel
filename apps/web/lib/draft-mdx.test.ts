import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { draftToMdx } from "./draft-mdx";

const baseFields = {
  title: "Meu post",
  slug: "meu-post",
  summary: "Um resumo válido.",
  tags: "typescript, react",
  body: "## Seção\n\nconteúdo do post",
};

describe("draftToMdx", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-07-16T15:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("generates frontmatter and body byte for byte", () => {
    expect(draftToMdx(baseFields)).toBe(
      [
        "---",
        'title: "Meu post"',
        "date: 2026-07-16",
        'summary: "Um resumo válido."',
        'tags: ["typescript", "react"]',
        "---",
        "",
        "## Seção",
        "",
        "conteúdo do post",
      ].join("\n"),
    );
  });

  it("escapes quotes in title and summary", () => {
    const mdx = draftToMdx({
      ...baseFields,
      title: 'Post "com aspas"',
      summary: 'Resumo com "aspas" no meio',
    });
    expect(mdx).toContain('title: "Post \\"com aspas\\""');
    expect(mdx).toContain('summary: "Resumo com \\"aspas\\" no meio"');
  });

  it("turns an empty tag string into an empty array", () => {
    expect(draftToMdx({ ...baseFields, tags: "" })).toContain("tags: []");
  });

  it("trims tags and drops empty entries", () => {
    expect(draftToMdx({ ...baseFields, tags: "  a , b ,, c  " })).toContain(
      'tags: ["a", "b", "c"]',
    );
  });
});
