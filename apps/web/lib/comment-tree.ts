export type CommentRow = {
  id: string;
  parentId: string | null;
  authorId: string;
  authorName: string;
  body: string;
  createdAt: Date;
  deletedAt: Date | null;
};

export type CommentNode = {
  id: string;
  parentId: string | null;
  authorId: string | null;
  authorName: string | null;
  body: string | null;
  createdAt: string;
  deleted: boolean;
  replies: CommentNode[];
};

// Reddit-style soft delete: a removed comment keeps its slot in the tree but
// loses body and author, so replies below it stay attached and readable
function toNode(row: CommentRow): CommentNode {
  const deleted = row.deletedAt !== null;
  return {
    id: row.id,
    parentId: row.parentId,
    authorId: deleted ? null : row.authorId,
    authorName: deleted ? null : row.authorName,
    body: deleted ? null : row.body,
    createdAt: row.createdAt.toISOString(),
    deleted,
    replies: [],
  };
}

export function buildCommentTree(rows: CommentRow[]): CommentNode[] {
  const nodesById = new Map<string, CommentNode>();
  for (const row of rows) {
    nodesById.set(row.id, toNode(row));
  }

  const roots: CommentNode[] = [];
  for (const row of rows) {
    const node = nodesById.get(row.id);
    if (!node) continue;
    const parent = row.parentId ? nodesById.get(row.parentId) : undefined;
    if (parent) {
      parent.replies.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}
