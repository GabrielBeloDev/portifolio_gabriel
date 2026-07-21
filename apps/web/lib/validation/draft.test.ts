import { describe, expect, it } from "vitest";
import {
  diagnosticsFor,
  projectDiagnostics,
  publishDiagnostics,
  publishReadinessIssues,
  studyDiagnostics,
} from "./draft";

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

const cleanDraft = {
  ...readyDraft,
  tags: "typescript, react",
  body: "## Seção\n\ntexto\n\n### Subseção\n\nmais texto",
};

describe("publishDiagnostics", () => {
  it("returns no diagnostics for a clean draft", () => {
    expect(publishDiagnostics(cleanDraft, ["outro-post"])).toEqual([]);
  });

  it("carries readiness issues as errors", () => {
    const diagnostics = publishDiagnostics(
      { ...cleanDraft, title: "  ", summary: "a".repeat(301) },
      [],
    );
    expect(diagnostics).toContainEqual({
      severity: "error",
      message: "título vazio",
    });
    expect(diagnostics).toContainEqual({
      severity: "error",
      message: "resumo > 300 caracteres",
    });
  });

  it("flags a title over 120 characters as error", () => {
    const diagnostics = publishDiagnostics(
      { ...cleanDraft, title: "t".repeat(121) },
      [],
    );
    expect(diagnostics).toContainEqual({
      severity: "error",
      message: "título > 120 caracteres",
    });
  });

  it("warns when the draft has no tags", () => {
    const noTags = publishDiagnostics({ ...cleanDraft, tags: "" }, []);
    const onlySeparators = publishDiagnostics(
      { ...cleanDraft, tags: " , , " },
      [],
    );
    const expected = { severity: "warning", message: "post sem tags" };
    expect(noTags).toContainEqual(expected);
    expect(onlySeparators).toContainEqual(expected);
  });

  it("warns when a heading skips a level", () => {
    const diagnostics = publishDiagnostics(
      { ...cleanDraft, body: "## Seção\n\n#### Detalhe" },
      [],
    );
    expect(diagnostics).toContainEqual({
      severity: "warning",
      message: 'heading pula de h2 para h4: "Detalhe"',
    });
  });

  it("does not flag sequential heading levels nor headings going up", () => {
    const diagnostics = publishDiagnostics(
      { ...cleanDraft, body: "## A\n\n### B\n\n## C" },
      [],
    );
    expect(diagnostics).toEqual([]);
  });

  it("ignores headings, images and links inside fenced code blocks", () => {
    const body =
      "## Seção\n\n```md\n#### pulo\n![](sem-alt.png)\n[x](/blog/nao-existe)\n```\n\ntexto";
    expect(publishDiagnostics({ ...cleanDraft, body }, [])).toEqual([]);
  });

  it("warns on markdown images without alt text", () => {
    const diagnostics = publishDiagnostics(
      { ...cleanDraft, body: "## Seção\n\n![](/img/foto.png)" },
      [],
    );
    expect(diagnostics).toContainEqual({
      severity: "warning",
      message: "imagem sem alt: /img/foto.png",
    });
  });

  it("does not warn on images with alt text", () => {
    const diagnostics = publishDiagnostics(
      { ...cleanDraft, body: "## Seção\n\n![uma foto](/img/foto.png)" },
      [],
    );
    expect(diagnostics).toEqual([]);
  });

  it("flags internal links to unpublished slugs as errors", () => {
    const diagnostics = publishDiagnostics(
      { ...cleanDraft, body: "## Seção\n\n[link](/blog/nao-existe)" },
      ["existe"],
    );
    expect(diagnostics).toContainEqual({
      severity: "error",
      message: "link interno quebrado: /blog/nao-existe",
    });
  });

  it("accepts internal links to published slugs, including anchors", () => {
    const body = "## Seção\n\n[a](/blog/existe)\n\n[b](/blog/existe#secao)";
    expect(publishDiagnostics({ ...cleanDraft, body }, ["existe"])).toEqual([]);
  });

  it("collapses repeated occurrences of the same problem", () => {
    const body = "## Seção\n\n[a](/blog/sumiu)\n\n[b](/blog/sumiu)";
    const diagnostics = publishDiagnostics({ ...cleanDraft, body }, []);
    expect(
      diagnostics.filter((d) => d.message.includes("/blog/sumiu")),
    ).toHaveLength(1);
  });

  it("orders errors before warnings", () => {
    const diagnostics = publishDiagnostics(
      { ...cleanDraft, tags: "", body: "[a](/blog/sumiu)" },
      [],
    );
    const severities = diagnostics.map((d) => d.severity);
    expect(severities.indexOf("warning")).toBeGreaterThan(
      severities.lastIndexOf("error"),
    );
  });
});

const readyStudy = {
  title: "Meu estudo",
  slug: "meu-estudo",
  summary: "Um resumo válido.",
  body: "## Seção\n\ntexto",
};

const emptyStudyContext = { publishedPostSlugs: [], projectSlugs: [] };

describe("studyDiagnostics", () => {
  it("returns no diagnostics for a clean study without a project link", () => {
    expect(studyDiagnostics(readyStudy, emptyStudyContext)).toEqual([]);
  });

  it("never warns about missing tags", () => {
    const diagnostics = studyDiagnostics(readyStudy, emptyStudyContext);
    expect(diagnostics).not.toContainEqual({
      severity: "warning",
      message: "post sem tags",
    });
  });

  it("accepts a project link that exists", () => {
    const diagnostics = studyDiagnostics(
      { ...readyStudy, projectSlug: "este-site" },
      { publishedPostSlugs: [], projectSlugs: ["este-site"] },
    );
    expect(diagnostics).toEqual([]);
  });

  it("flags a project link that does not exist as error", () => {
    const diagnostics = studyDiagnostics(
      { ...readyStudy, projectSlug: "fantasma" },
      { publishedPostSlugs: [], projectSlugs: ["este-site"] },
    );
    expect(diagnostics).toContainEqual({
      severity: "error",
      message: "projeto vinculado inexistente fantasma",
    });
  });

  it("still checks readiness and broken internal links", () => {
    const diagnostics = studyDiagnostics(
      { ...readyStudy, title: "  ", body: "[x](/blog/sumiu)" },
      emptyStudyContext,
    );
    expect(diagnostics).toContainEqual({
      severity: "error",
      message: "título vazio",
    });
    expect(diagnostics).toContainEqual({
      severity: "error",
      message: "link interno quebrado: /blog/sumiu",
    });
  });
});

describe("diagnosticsFor", () => {
  const noTagsWarning = { severity: "warning" as const, message: "post sem tags" };

  it("routes a post to the post diagnostics, keeping the no-tags warning", () => {
    const diagnostics = diagnosticsFor(
      "post",
      { ...cleanDraft, tags: "" },
      emptyStudyContext,
    );
    expect(diagnostics).toContainEqual(noTagsWarning);
  });

  it("routes a study to the study diagnostics, dropping the no-tags warning", () => {
    const diagnostics = diagnosticsFor(
      "study",
      { ...cleanDraft, tags: "" },
      emptyStudyContext,
    );
    expect(diagnostics).not.toContainEqual(noTagsWarning);
  });

  it("routes a project to the project diagnostics", () => {
    const diagnostics = diagnosticsFor(
      "project",
      { ...cleanDraft, tags: "", category: "faculdade" },
      emptyStudyContext,
    );
    expect(diagnostics).toContainEqual({
      severity: "warning",
      message: "projeto sem stack",
    });
  });
});

const readyProject = {
  title: "Cosmo",
  slug: "cosmo",
  summary: "Plataforma de estudo.",
  tags: "React, Node",
  category: "faculdade",
};

describe("projectDiagnostics", () => {
  it("returns no diagnostics for a ready project", () => {
    expect(projectDiagnostics(readyProject)).toEqual([]);
  });

  it("flags a title over 80 and a summary over 200", () => {
    const diagnostics = projectDiagnostics({
      ...readyProject,
      title: "t".repeat(81),
      summary: "s".repeat(201),
    });
    expect(diagnostics).toContainEqual({
      severity: "error",
      message: "título > 80 caracteres",
    });
    expect(diagnostics).toContainEqual({
      severity: "error",
      message: "resumo > 200 caracteres",
    });
  });

  it("rejects a malformed repo url but accepts a valid live url", () => {
    expect(projectDiagnostics({ ...readyProject, repo: "nao-e-url" })).toContainEqual(
      { severity: "error", message: "repo não é uma URL válida" },
    );
    expect(
      projectDiagnostics({ ...readyProject, live: "https://x.dev" }),
    ).toEqual([]);
  });

  it("rejects an invalid category", () => {
    expect(
      projectDiagnostics({ ...readyProject, category: "inventada" }),
    ).toContainEqual({
      severity: "error",
      message: "categoria inválida inventada",
    });
  });

  it("warns when the project has no stack", () => {
    expect(projectDiagnostics({ ...readyProject, tags: "" })).toContainEqual({
      severity: "warning",
      message: "projeto sem stack",
    });
  });
});
