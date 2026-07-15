import type { Root } from "mdast";
import type { MdxJsxFlowElement } from "mdast-util-mdx-jsx";
import { visit } from "unist-util-visit";

/** Turns ```mermaid fenced blocks into <Mermaid chart="..."/> before the
 *  syntax highlighter runs, so diagrams render as diagrams, not code. */
export function remarkMermaid() {
  return (tree: Root) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang !== "mermaid" || parent === undefined || index === undefined) {
        return;
      }
      const element: MdxJsxFlowElement = {
        type: "mdxJsxFlowElement",
        name: "Mermaid",
        attributes: [{ type: "mdxJsxAttribute", name: "chart", value: node.value }],
        children: [],
      };
      parent.children[index] = element;
    });
  };
}
