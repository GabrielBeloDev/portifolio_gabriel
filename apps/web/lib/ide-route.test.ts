import { describe, expect, it } from "vitest";
import { breadcrumbTrail, ideCrumb, routeTab } from "./ide-route";

describe("ideCrumb", () => {
  it("mapeia rotas estáticas para nomes de arquivo", () => {
    expect(ideCrumb("/")).toBe("~/home");
    expect(ideCrumb("/sobre")).toBe("sobre.md");
    expect(ideCrumb("/projects")).toBe("projetos");
    expect(ideCrumb("/uses")).toBe(".dotfiles");
    expect(ideCrumb("/entrar")).toBe("auth.config");
    expect(ideCrumb("/commits")).toBe(".git/log");
  });

  it("mapeia posts e estudos como arquivos .mdx dentro da pasta", () => {
    expect(ideCrumb("/blog/pipeline-do-blog")).toBe("blog / pipeline-do-blog.mdx");
    expect(ideCrumb("/estudos/como-construi-este-site")).toBe(
      "estudos / como-construi-este-site.mdx",
    );
  });

  it("usa o pathname sem barra para rotas desconhecidas", () => {
    expect(ideCrumb("/rota-inexistente")).toBe("rota-inexistente");
  });
});

describe("routeTab", () => {
  it("resolve a tab de rotas conhecidas com o arquivo certo", () => {
    expect(routeTab("/")).toMatchObject({ label: "home.tsx", modified: false });
    expect(routeTab("/blog")).toMatchObject({ label: "blog", modified: false });
    expect(routeTab("/sobre")).toMatchObject({
      label: "sobre.md",
      modified: false,
    });
  });

  it("abre posts como tab .mdx modificada", () => {
    expect(routeTab("/blog/pipeline-do-blog")).toMatchObject({
      href: "/blog/pipeline-do-blog",
      label: "pipeline-do-blog.mdx",
      modified: true,
    });
  });

  it("abre .dotfiles em /uses sem marcador de modificado", () => {
    expect(routeTab("/uses")).toMatchObject({
      href: "/uses",
      label: ".dotfiles",
      modified: false,
    });
  });

  it("abre auth.config em /entrar sem marcador de modificado", () => {
    expect(routeTab("/entrar")).toMatchObject({
      label: "auth.config",
      modified: false,
    });
  });

  it("abre .git/log em /commits sem marcador de modificado", () => {
    expect(routeTab("/commits")).toMatchObject({
      href: "/commits",
      label: ".git/log",
      modified: false,
    });
  });

  it("abre tab de editor modificada em /admin/editor", () => {
    expect(routeTab("/admin/editor")).toMatchObject({
      label: "editor",
      modified: true,
    });
  });

  it("abre tab de admin sem marcador na raiz do admin", () => {
    expect(routeTab("/admin")).toMatchObject({
      href: "/admin",
      label: "admin",
      modified: false,
    });
  });

  it("retorna null para rota desconhecida", () => {
    expect(routeTab("/rota-inexistente")).toBeNull();
  });
});

describe("breadcrumbTrail", () => {
  it("separa seção e arquivo em rotas de conteúdo", () => {
    expect(breadcrumbTrail("/blog/pipeline-do-blog")).toEqual({
      section: "blog",
      slug: "pipeline-do-blog",
      leafLabel: "pipeline-do-blog.mdx",
    });
    expect(breadcrumbTrail("/estudos/como-construi-este-site")).toEqual({
      section: "estudos",
      slug: "como-construi-este-site",
      leafLabel: "como-construi-este-site.mdx",
    });
  });

  it("marca os índices de blog e estudos como seção sem arquivo", () => {
    expect(breadcrumbTrail("/blog")).toEqual({
      section: "blog",
      slug: null,
      leafLabel: null,
    });
    expect(breadcrumbTrail("/estudos")).toEqual({
      section: "estudos",
      slug: null,
      leafLabel: null,
    });
  });

  it("usa o label de arquivo das rotas conhecidas", () => {
    expect(breadcrumbTrail("/")).toEqual({
      section: null,
      slug: null,
      leafLabel: "home.tsx",
    });
    expect(breadcrumbTrail("/sobre")).toEqual({
      section: null,
      slug: null,
      leafLabel: "sobre.md",
    });
  });

  it("cai no crumb genérico para rotas fora do mapa", () => {
    expect(breadcrumbTrail("/admin")).toEqual({
      section: null,
      slug: null,
      leafLabel: "admin",
    });
  });
});
