import { describe, expect, it } from "vitest";
import { ideCrumb, routeTab } from "./ide-route";

describe("ideCrumb", () => {
  it("mapeia rotas estáticas para nomes de arquivo", () => {
    expect(ideCrumb("/")).toBe("~/home");
    expect(ideCrumb("/sobre")).toBe("sobre.md");
    expect(ideCrumb("/projects")).toBe("projetos");
    expect(ideCrumb("/uses")).toBe(".dotfiles");
    expect(ideCrumb("/entrar")).toBe("auth.config");
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
