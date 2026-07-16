export type IdeIcon = "🏠" | "📁" | "📄" | "📝" | "⚙";

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
  "/entrar": { href: "/entrar", label: "auth.config", icon: "⚙" },
} as const satisfies Record<string, IdeFile>;

const BASE_TAB_ROUTES = [
  "/",
  "/blog",
  "/projects",
  "/estudos",
  "/sobre",
] as const;

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

export function ideTabs(pathname: string): IdeTab[] {
  const baseTabs = BASE_TAB_ROUTES.map((route) => ({
    ...ROUTE_FILES[route],
    modified: false,
  }));
  const deepTab = deriveDeepTab(pathname);
  return deepTab ? [...baseTabs, deepTab] : baseTabs;
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
