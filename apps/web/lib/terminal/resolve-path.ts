import type { FsNode } from "./types";

// Normalizes an argument against the current dir into an absolute path. ".."
// can never pop past the root, so path traversal out of the virtual tree is
// structurally impossible, not filtered.
export function resolvePath(cwd: string, arg: string): string {
  const segments = arg.startsWith("/") ? [] : cwd.split("/").filter(Boolean);
  for (const part of arg.split("/")) {
    if (part === "" || part === ".") continue;
    if (part === "~") {
      segments.length = 0;
      continue;
    }
    if (part === "..") {
      segments.pop();
      continue;
    }
    segments.push(part);
  }
  return "/" + segments.join("/");
}

export function findNode(root: FsNode, absPath: string): FsNode | null {
  let current: FsNode = root;
  for (const segment of absPath.split("/").filter(Boolean)) {
    const next = current.children?.find((child) => child.name === segment);
    if (!next) return null;
    current = next;
  }
  return current;
}

export function listDir(root: FsNode, absPath: string): readonly FsNode[] | null {
  const node = findNode(root, absPath);
  if (!node || node.type !== "dir") return null;
  return node.children ?? [];
}
