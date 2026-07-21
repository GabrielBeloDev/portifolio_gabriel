import { describe, expect, it } from "vitest";
import {
  imageMarkdown,
  imageUploadPlaceholder,
  insertText,
  removeImagePlaceholder,
  resolveImagePlaceholder,
} from "./editor-text";

describe("imageUploadPlaceholder", () => {
  it("embeds the token so concurrent uploads never collide", () => {
    expect(imageUploadPlaceholder("a")).not.toBe(imageUploadPlaceholder("b"));
    expect(imageUploadPlaceholder("abc")).toContain("abc");
  });
});

describe("insertText", () => {
  it("inserts at the caret and moves the caret past the insertion", () => {
    const result = insertText("ab", 1, 1, "XY");
    expect(result.value).toBe("aXYb");
    expect(result.selectionStart).toBe(3);
    expect(result.selectionEnd).toBe(3);
  });

  it("replaces the current selection", () => {
    const result = insertText("hello world", 6, 11, "there");
    expect(result.value).toBe("hello there");
    expect(result.selectionStart).toBe(11);
  });

  it("appends when the caret sits at the end", () => {
    const result = insertText("abc", 3, 3, "!");
    expect(result.value).toBe("abc!");
    expect(result.selectionStart).toBe(4);
  });

  it("inserts into an empty value", () => {
    const result = insertText("", 0, 0, "x");
    expect(result.value).toBe("x");
    expect(result.selectionStart).toBe(1);
  });
});

describe("resolveImagePlaceholder", () => {
  it("swaps the placeholder for image markdown with the caret inside the alt", () => {
    const placeholder = imageUploadPlaceholder("t1");
    const value = `before ${placeholder} after`;
    const result = resolveImagePlaceholder(value, placeholder, "https://x/y.png");
    expect(result).not.toBeNull();
    expect(result!.value).toBe("before ![](https://x/y.png) after");
    // caret sits between "![" and "](" — inside the empty alt
    expect(result!.value.slice(result!.selectionStart, result!.selectionStart + 2)).toBe(
      "](",
    );
    expect(result!.value[result!.selectionStart - 1]).toBe("[");
  });

  it("resolves only the matching token when several placeholders coexist", () => {
    const first = imageUploadPlaceholder("first");
    const second = imageUploadPlaceholder("second");
    const value = `${first}\n${second}`;
    const result = resolveImagePlaceholder(value, second, "https://x/2.png");
    expect(result!.value).toBe(`${first}\n![](https://x/2.png)`);
  });

  it("returns null when the placeholder was removed mid-upload", () => {
    expect(
      resolveImagePlaceholder("no marker here", imageUploadPlaceholder("t"), "u"),
    ).toBeNull();
  });
});

describe("removeImagePlaceholder", () => {
  it("drops the placeholder and parks the caret where it was", () => {
    const placeholder = imageUploadPlaceholder("t");
    const value = `a ${placeholder} b`;
    const result = removeImagePlaceholder(value, placeholder);
    expect(result!.value).toBe("a  b");
    expect(result!.selectionStart).toBe(2);
  });

  it("returns null when the placeholder is gone", () => {
    expect(removeImagePlaceholder("clean", imageUploadPlaceholder("t"))).toBeNull();
  });
});

describe("imageMarkdown", () => {
  it("builds markdown with an empty alt", () => {
    expect(imageMarkdown("https://x/z.png")).toBe("![](https://x/z.png)");
  });
});
