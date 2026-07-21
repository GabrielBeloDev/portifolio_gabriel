import { describe, expect, it } from "vitest";
import { projectToYaml } from "./project-yaml";

const base = {
  title: "Cosmo",
  summary: "Plataforma pra aprender programação.",
  stack: ["React", "Node"],
  category: "faculdade" as const,
  order: 3,
};

describe("projectToYaml", () => {
  it("emits valid YAML with a flow-sequence stack, byte for byte", () => {
    expect(projectToYaml(base)).toBe(
      [
        'title: "Cosmo"',
        'summary: "Plataforma pra aprender programação."',
        'stack: ["React", "Node"]',
        'category: "faculdade"',
        "order: 3",
        "",
      ].join("\n"),
    );
  });

  it("omits repo and live when absent", () => {
    const yaml = projectToYaml(base);
    expect(yaml).not.toContain("repo:");
    expect(yaml).not.toContain("live:");
  });

  it("includes present urls and drops blank ones", () => {
    const yaml = projectToYaml({ ...base, repo: "https://x.dev", live: "  " });
    expect(yaml).toContain('repo: "https://x.dev"');
    expect(yaml).not.toContain("live:");
  });

  it("escapes characters that would break YAML", () => {
    const yaml = projectToYaml({
      ...base,
      summary: 'Tem dois pontos: e "aspas"',
    });
    expect(yaml).toContain('summary: "Tem dois pontos: e \\"aspas\\""');
  });
});
