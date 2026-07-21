import { describe, expect, it } from "vitest";
import { findNode, listDir, resolvePath } from "./resolve-path";
import type { FsNode } from "./types";

const root: FsNode = {
  name: "",
  type: "dir",
  children: [
    { name: "sobre.md", type: "file", href: "/sobre" },
    {
      name: "blog",
      type: "dir",
      children: [{ name: "post.mdx", type: "file", href: "/blog/post" }],
    },
  ],
};

describe("resolvePath", () => {
  it("resolves a relative child", () => {
    expect(resolvePath("/", "blog")).toBe("/blog");
    expect(resolvePath("/blog", "post.mdx")).toBe("/blog/post.mdx");
  });

  it("resolves an absolute path regardless of cwd", () => {
    expect(resolvePath("/blog", "/sobre.md")).toBe("/sobre.md");
  });

  it("goes up with .. but never past the root", () => {
    expect(resolvePath("/blog", "..")).toBe("/");
    expect(resolvePath("/blog", "../..")).toBe("/");
    expect(resolvePath("/", "..")).toBe("/");
  });

  it("clamps traversal attempts to the root (no host escape)", () => {
    expect(resolvePath("/blog", "../../../etc/passwd")).toBe("/etc/passwd");
    expect(findNode(root, resolvePath("/blog", "../../../etc/passwd"))).toBeNull();
  });

  it("ignores . and empty segments and resets on ~", () => {
    expect(resolvePath("/blog", "./post.mdx")).toBe("/blog/post.mdx");
    expect(resolvePath("/blog", "~")).toBe("/");
  });
});

describe("findNode / listDir", () => {
  it("finds the root and nested nodes", () => {
    expect(findNode(root, "/")?.type).toBe("dir");
    expect(findNode(root, "/blog/post.mdx")?.href).toBe("/blog/post");
  });

  it("returns null for missing paths", () => {
    expect(findNode(root, "/nope")).toBeNull();
  });

  it("lists a directory, null for a file or missing dir", () => {
    expect(listDir(root, "/blog")?.map((n) => n.name)).toEqual(["post.mdx"]);
    expect(listDir(root, "/sobre.md")).toBeNull();
    expect(listDir(root, "/nope")).toBeNull();
  });
});
