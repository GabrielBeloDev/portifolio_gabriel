import { describe, expect, it } from "vitest";
import { runCommand } from "./commands";
import { buildVirtualFs, type TerminalDoc } from "./virtual-fs";

const posts: TerminalDoc[] = [
  { slug: "meu-post", title: "Meu Post", summary: "um resumo", date: "2026-01-01", tags: ["ts"] },
];
const fs = buildVirtualFs({ posts, caseStudies: [] });
const run = (line: string, cwd = "/") => runCommand(line, fs, { cwd });

describe("runCommand", () => {
  it("lists the root and marks directories", () => {
    const out = run("ls").output;
    expect(out.some((l) => l.text === "blog/" && l.tone === "dir")).toBe(true);
    expect(out.some((l) => l.text === "sobre.md")).toBe(true);
  });

  it("lists a subdirectory by name", () => {
    const names = run("ls blog").output.map((l) => l.text);
    expect(names).toContain("meu-post.mdx");
  });

  it("errors on ls of a missing path", () => {
    expect(run("ls nope").output[0]?.tone).toBe("error");
  });

  it("cd into a dir updates cwd, cd into a file errors", () => {
    expect(run("cd blog").newCwd).toBe("/blog");
    expect(run("cd sobre.md").output[0]?.tone).toBe("error");
  });

  it("cd .. from a nested dir clamps at root", () => {
    expect(run("cd ../..", "/blog").newCwd).toBe("/");
  });

  it("cat prints a post preview, errors on a directory", () => {
    const body = run("cat blog/meu-post.mdx").output.map((l) => l.text).join("\n");
    expect(body).toContain("Meu Post");
    expect(body).toContain("um resumo");
    expect(run("cat blog").output[0]?.tone).toBe("error");
  });

  it("open navigates to the route, with anchor for dotfiles", () => {
    expect(run("open blog/meu-post.mdx").navigateTo).toBe("/blog/meu-post");
    expect(run("open .dotfiles/hardware.json").navigateTo).toBe("/uses#hardware-json");
  });

  it("clear signals a wipe and whoami is flavor", () => {
    expect(run("clear").clear).toBe(true);
    expect(run("whoami").output[0]?.text).toBe("visitante");
  });

  it("unknown command reports not found and never throws on traversal", () => {
    expect(run("foobar").output[0]?.text).toContain("command not found");
    expect(() => run("cat ../../../etc/passwd")).not.toThrow();
    expect(run("cat ../../../etc/passwd").output[0]?.tone).toBe("error");
  });

  it("empty line is a no-op", () => {
    expect(run("   ").output).toEqual([]);
  });
});
