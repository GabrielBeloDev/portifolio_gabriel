export interface IdeTab {
  href: string;
  label: string;
  icon: string;
  modified: boolean;
}

const BASE_TABS: readonly IdeTab[] = [
  { href: "/", label: "home.tsx", icon: "🏠", modified: false },
  { href: "/blog", label: "blog", icon: "📁", modified: false },
  { href: "/projects", label: "projetos", icon: "📁", modified: false },
  { href: "/estudos", label: "estudos", icon: "📁", modified: false },
  { href: "/sobre", label: "sobre.md", icon: "📄", modified: false },
];

const STATIC_CRUMBS: Record<string, string> = {
  "/": "~/home",
  "/sobre": "sobre.md",
  "/blog": "blog",
  "/projects": "projetos",
  "/estudos": "estudos",
  "/entrar": "auth.config",
  "/admin": "admin",
  "/admin/editor": "admin / editor",
};

const CONTENT_ROUTE = /^\/(blog|estudos)\/([^/]+)$/;

export function ideCrumb(pathname: string): string {
  const staticCrumb = STATIC_CRUMBS[pathname];
  if (staticCrumb) return staticCrumb;

  const contentMatch = pathname.match(CONTENT_ROUTE);
  if (contentMatch) return `${contentMatch[1]} / ${contentMatch[2]}.mdx`;

  return pathname.replace(/^\//, "");
}

export function ideTabs(pathname: string): IdeTab[] {
  const deepTab = deriveDeepTab(pathname);
  return deepTab ? [...BASE_TABS, deepTab] : [...BASE_TABS];
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
    return { href: "/entrar", label: "auth.config", icon: "⚙", modified: false };
  }

  if (pathname === "/admin/editor") {
    return { href: "/admin/editor", label: "editor", icon: "📝", modified: true };
  }

  if (pathname.startsWith("/admin")) {
    return { href: "/admin", label: "admin", icon: "⚙", modified: false };
  }

  return null;
}
