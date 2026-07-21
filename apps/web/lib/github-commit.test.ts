import { describe, expect, it } from "vitest";
import {
  buildCommitPayload,
  contentPath,
  contentsApiUrl,
  encodeFileContent,
  postContentPath,
} from "./github-commit";

describe("postContentPath", () => {
  it("maps a slug to its post file under the web content dir", () => {
    expect(postContentPath("meu-post")).toBe(
      "apps/web/content/posts/meu-post.mdx",
    );
  });
});

describe("contentPath", () => {
  it("routes each type to its collection directory and extension", () => {
    expect(contentPath("post", "x")).toBe("apps/web/content/posts/x.mdx");
    expect(contentPath("study", "x")).toBe(
      "apps/web/content/case-studies/x.mdx",
    );
    expect(contentPath("project", "x")).toBe(
      "apps/web/content/projects/x.yml",
    );
  });
});

describe("contentsApiUrl", () => {
  it("targets the Contents API of the portfolio repo", () => {
    expect(contentsApiUrl("apps/web/content/posts/meu-post.mdx")).toBe(
      "https://api.github.com/repos/GabrielBeloDev/portifolio_gabriel/contents/apps/web/content/posts/meu-post.mdx",
    );
  });
});

describe("encodeFileContent", () => {
  it("base64-encodes utf8 content", () => {
    expect(encodeFileContent("olá mundo")).toBe(
      Buffer.from("olá mundo", "utf8").toString("base64"),
    );
  });

  it("round-trips back to the original text", () => {
    const original = "---\ntitle: \"x\"\n---\n\nconteúdo com acento é";
    const decoded = Buffer.from(
      encodeFileContent(original),
      "base64",
    ).toString("utf8");
    expect(decoded).toBe(original);
  });
});

describe("buildCommitPayload", () => {
  it("omits sha when the file is new", () => {
    const payload = buildCommitPayload({
      message: "content: publish x",
      content: "corpo",
      sha: null,
    });
    expect(payload).toEqual({
      message: "content: publish x",
      content: encodeFileContent("corpo"),
      branch: "main",
    });
    expect(payload).not.toHaveProperty("sha");
  });

  it("includes sha when updating an existing file", () => {
    const payload = buildCommitPayload({
      message: "content: publish x",
      content: "corpo",
      sha: "abc123",
    });
    expect(payload.sha).toBe("abc123");
    expect(payload.branch).toBe("main");
  });
});
