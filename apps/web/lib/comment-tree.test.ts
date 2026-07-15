import { describe, expect, it } from "vitest";
import { buildCommentTree, type CommentRow } from "./comment-tree";

const baseRow = (overrides: Partial<CommentRow>): CommentRow => ({
  id: "00000000-0000-0000-0000-000000000000",
  parentId: null,
  authorId: "author-1",
  authorName: "Ana",
  body: "olá",
  createdAt: new Date("2026-07-15T10:00:00Z"),
  deletedAt: null,
  ...overrides,
});

describe("buildCommentTree", () => {
  it("nests replies under their parents at any depth", () => {
    const rows = [
      baseRow({ id: "a" }),
      baseRow({ id: "b", parentId: "a", authorName: "Bruno" }),
      baseRow({ id: "c", parentId: "b" }),
    ];

    const tree = buildCommentTree(rows);

    expect(tree).toHaveLength(1);
    expect(tree[0]?.replies[0]?.authorName).toBe("Bruno");
    expect(tree[0]?.replies[0]?.replies[0]?.id).toBe("c");
  });

  it("keeps replies attached when a mid-thread comment is soft deleted", () => {
    const rows = [
      baseRow({ id: "a" }),
      baseRow({ id: "b", parentId: "a", deletedAt: new Date() }),
      baseRow({ id: "c", parentId: "b", body: "resposta viva" }),
    ];

    const tree = buildCommentTree(rows);
    const removed = tree[0]?.replies[0];

    expect(removed?.deleted).toBe(true);
    expect(removed?.body).toBeNull();
    expect(removed?.authorName).toBeNull();
    expect(removed?.replies[0]?.body).toBe("resposta viva");
  });

  it("keeps sibling order by creation date as provided by the query", () => {
    const rows = [
      baseRow({ id: "a", createdAt: new Date("2026-07-15T10:00:00Z") }),
      baseRow({ id: "b", createdAt: new Date("2026-07-15T11:00:00Z") }),
    ];

    const tree = buildCommentTree(rows);

    expect(tree.map((node) => node.id)).toEqual(["a", "b"]);
  });
});
