import { ROUTE_FILES, USES_DOTFILES } from "../ide-route";
import type { FsNode } from "./types";

export interface TerminalDoc {
  readonly slug: string;
  readonly title: string;
  readonly summary: string;
  readonly date: string;
  readonly tags: readonly string[];
}

function docPreview(doc: TerminalDoc): string {
  const tags = doc.tags.length > 0 ? doc.tags.join(", ") : "nenhuma";
  return [
    "---",
    `title: ${doc.title}`,
    `date: ${doc.date}`,
    `tags: ${tags}`,
    "---",
    "",
    doc.summary,
  ].join("\n");
}

function docFile(doc: TerminalDoc, section: "blog" | "estudos"): FsNode {
  return {
    name: `${doc.slug}.mdx`,
    type: "file",
    icon: section === "blog" ? "📝" : "📄",
    href: `/${section}/${doc.slug}`,
    preview: docPreview(doc),
  };
}

function routeFile(pathname: keyof typeof ROUTE_FILES, preview: string): FsNode {
  const route = ROUTE_FILES[pathname];
  return {
    name: route.label,
    type: "file",
    icon: route.icon,
    href: route.href,
    preview,
  };
}

export function buildVirtualFs(input: {
  posts: readonly TerminalDoc[];
  caseStudies: readonly TerminalDoc[];
}): FsNode {
  const blog: FsNode = {
    name: "blog",
    type: "dir",
    icon: "📁",
    href: "/blog",
    children: [
      { name: "index", type: "file", href: "/blog", preview: "Índice do blog. Use open para abrir." },
      ...input.posts.map((post) => docFile(post, "blog")),
    ],
  };

  const estudos: FsNode = {
    name: "estudos",
    type: "dir",
    icon: "📁",
    href: "/estudos",
    children: [
      { name: "index", type: "file", href: "/estudos", preview: "Índice dos estudos de caso. Use open para abrir." },
      ...input.caseStudies.map((study) => docFile(study, "estudos")),
    ],
  };

  const dotfiles: FsNode = {
    name: ".dotfiles",
    type: "dir",
    icon: "⚙",
    href: "/uses",
    children: USES_DOTFILES.map((dotfile) => ({
      name: dotfile.filename,
      type: "file" as const,
      href: "/uses",
      anchor: dotfile.anchor,
      preview: `Config exibida em /uses. Use "open ${dotfile.filename}" para ver.`,
    })),
  };

  const git: FsNode = {
    name: ".git",
    type: "dir",
    icon: "⑂",
    children: [
      {
        name: "log",
        type: "file",
        icon: "⑂",
        href: "/commits",
        preview: "Histórico de commits. Use open para ver.",
      },
    ],
  };

  return {
    name: "",
    type: "dir",
    children: [
      routeFile("/", "A home do site. Use open para abrir."),
      routeFile("/sobre", "Quem é o Gabriel. Use open para abrir."),
      blog,
      estudos,
      dotfiles,
      routeFile("/projects", "Projetos. Use open para abrir."),
      routeFile("/entrar", "Tela de login. Use open para abrir."),
      git,
    ],
  };
}
