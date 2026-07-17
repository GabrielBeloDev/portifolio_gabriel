export type IdeIcon = "🏠" | "📁" | "📄" | "📝" | "⚙" | "⑂";

export interface IdeFile {
  readonly href: string;
  readonly label: string;
  readonly icon: IdeIcon;
}

export interface IdeTab extends IdeFile {
  readonly modified: boolean;
}

export const ROUTE_FILES = {
  "/": { href: "/", label: "home.tsx", icon: "🏠" },
  "/blog": { href: "/blog", label: "blog", icon: "📁" },
  "/projects": { href: "/projects", label: "projetos", icon: "📁" },
  "/estudos": { href: "/estudos", label: "estudos", icon: "📁" },
  "/sobre": { href: "/sobre", label: "sobre.md", icon: "📄" },
  "/uses": { href: "/uses", label: ".dotfiles", icon: "⚙" },
  "/entrar": { href: "/entrar", label: "auth.config", icon: "⚙" },
  "/commits": { href: "/commits", label: ".git/log", icon: "⑂" },
} as const satisfies Record<string, IdeFile>;

export interface UsesDotfile {
  readonly anchor: string;
  readonly filename: string;
}

export const USES_DOTFILES = [
  { anchor: "hardware-json", filename: "hardware.json" },
  { anchor: "stack-json", filename: "stack.json" },
  { anchor: "tools-txt", filename: "tools.txt" },
  { anchor: "site-config", filename: "site.config" },
] as const satisfies readonly UsesDotfile[];

const CONTENT_ROUTE = /^\/(blog|estudos)\/([^/]+)$/;

function isKnownRoute(pathname: string): pathname is keyof typeof ROUTE_FILES {
  return pathname in ROUTE_FILES;
}

export function ideCrumb(pathname: string): string {
  if (pathname === "/") return "~/home";
  if (isKnownRoute(pathname)) return ROUTE_FILES[pathname].label;
  if (pathname === "/admin") return "admin";
  if (pathname === "/admin/editor") return "admin / editor";

  const contentMatch = pathname.match(CONTENT_ROUTE);
  if (contentMatch) return `${contentMatch[1]} / ${contentMatch[2]}.mdx`;

  return pathname.replace(/^\//, "");
}

export type ContentSection = "blog" | "estudos";

export interface BreadcrumbTrail {
  readonly section: ContentSection | null;
  readonly slug: string | null;
  readonly leafLabel: string | null;
}

export function breadcrumbTrail(pathname: string): BreadcrumbTrail {
  const [, sectionMatch, slugMatch] = pathname.match(CONTENT_ROUTE) ?? [];
  if (sectionMatch !== undefined && slugMatch !== undefined) {
    return {
      section: sectionMatch as ContentSection,
      slug: slugMatch,
      leafLabel: `${slugMatch}.mdx`,
    };
  }
  if (pathname === "/blog" || pathname === "/estudos") {
    return {
      section: pathname.slice(1) as ContentSection,
      slug: null,
      leafLabel: null,
    };
  }
  const leafLabel = isKnownRoute(pathname)
    ? ROUTE_FILES[pathname].label
    : ideCrumb(pathname);
  return { section: null, slug: null, leafLabel };
}

// The tab descriptor a pathname opens in the session tab strip
export function routeTab(pathname: string): IdeTab | null {
  if (isKnownRoute(pathname)) {
    return { ...ROUTE_FILES[pathname], modified: false };
  }
  return deriveDeepTab(pathname);
}

function deriveDeepTab(pathname: string): IdeTab | null {
  const contentMatch = pathname.match(CONTENT_ROUTE);
  if (contentMatch) {
    return {
      href: pathname,
      label: `${contentMatch[2]}.mdx`,
      icon: "📝",
      modified: true,
    };
  }

  if (pathname === "/entrar") {
    return { ...ROUTE_FILES["/entrar"], modified: false };
  }

  if (pathname === "/admin/editor") {
    return { href: "/admin/editor", label: "editor", icon: "📝", modified: true };
  }

  if (pathname.startsWith("/admin")) {
    return { href: "/admin", label: "admin", icon: "⚙", modified: false };
  }

  return null;
}
