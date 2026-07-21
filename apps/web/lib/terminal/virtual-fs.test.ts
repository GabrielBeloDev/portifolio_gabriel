import { describe, expect, it } from "vitest";
import { findNode, listDir } from "./resolve-path";
import { buildVirtualFs, type TerminalDoc } from "./virtual-fs";

const posts: TerminalDoc[] = [
  { slug: "primeiro", title: "Primeiro", summary: "resumo um", date: "2026-01-01", tags: ["a"] },
  { slug: "segundo", title: "Segundo", summary: "resumo dois", date: "2026-02-01", tags: [] },
];
const caseStudies: TerminalDoc[] = [
  { slug: "caso", title: "Caso", summary: "estudo", date: "2026-03-01", tags: ["x"] },
];

const fs = buildVirtualFs({ posts, caseStudies });

describe("buildVirtualFs", () => {
  it("puts posts under /blog with an index", () => {
    const names = listDir(fs, "/blog")?.map((n) => n.name);
    expect(names).toEqual(["index", "primeiro.mdx", "segundo.mdx"]);
  });

  it("wires a post file to its route and a frontmatter preview", () => {
    const post = findNode(fs, "/blog/primeiro.mdx");
    expect(post?.href).toBe("/blog/primeiro");
    expect(post?.preview).toContain("title: Primeiro");
    expect(post?.preview).toContain("resumo um");
  });

  it("exposes the dotfiles with anchors under /uses", () => {
    const hardware = findNode(fs, "/.dotfiles/hardware.json");
    expect(hardware?.href).toBe("/uses");
    expect(hardware?.anchor).toBe("hardware-json");
  });

  it("keeps top-level route files navigable", () => {
    expect(findNode(fs, "/sobre.md")?.href).toBe("/sobre");
    expect(findNode(fs, "/.git/log")?.href).toBe("/commits");
  });
});
