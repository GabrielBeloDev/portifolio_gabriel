import type { Code, Root } from "mdast";
import { describe, expect, it } from "vitest";
import { remarkMermaid } from "./remark-mermaid";

const makeTree = (lang: string | null): Root => ({
  type: "root",
  children: [{ type: "code", lang, value: "graph TD; A-->B" } as Code],
});

describe("remarkMermaid", () => {
  it("replaces mermaid fences with a Mermaid JSX element carrying the chart", () => {
    const tree = makeTree("mermaid");
    remarkMermaid()(tree);

    expect(tree.children[0]).toMatchObject({
      type: "mdxJsxFlowElement",
      name: "Mermaid",
      attributes: [
        { type: "mdxJsxAttribute", name: "chart", value: "graph TD; A-->B" },
      ],
    });
  });

  it("leaves non-mermaid code blocks untouched", () => {
    const tree = makeTree("ts");
    remarkMermaid()(tree);

    expect(tree.children[0]).toMatchObject({ type: "code", lang: "ts" });
  });
});
