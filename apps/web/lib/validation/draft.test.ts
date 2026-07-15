import { describe, expect, it } from "vitest";
import { publishReadinessIssues } from "./draft";

const readyDraft = {
  title: "Meu post",
  slug: "meu-post",
  summary: "Um resumo válido.",
  body: "# Conteúdo",
};

describe("publishReadinessIssues", () => {
  it("returns no issues for a publish-ready draft", () => {
    expect(publishReadinessIssues(readyDraft)).toEqual([]);
  });

  it("flags empty title and body with readable messages", () => {
    const issues = publishReadinessIssues({
      ...readyDraft,
      title: "  ",
      body: "",
    });
    expect(issues).toContain("título vazio");
    expect(issues).toContain("corpo vazio");
  });

  it("rejects slugs that are not kebab-case", () => {
    const issues = publishReadinessIssues({ ...readyDraft, slug: "Meu Post!" });
    expect(issues).toHaveLength(1);
    expect(issues[0]).toContain("kebab-case");
  });
});
