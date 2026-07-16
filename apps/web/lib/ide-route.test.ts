import { describe, expect, it } from "vitest";
import { ideCrumb, ideTabs } from "./ide-route";

describe("ideCrumb", () => {
  it("mapeia rotas estáticas para nomes de arquivo", () => {
    expect(ideCrumb("/")).toBe("~/home");
    expect(ideCrumb("/sobre")).toBe("sobre.md");
    expect(ideCrumb("/projects")).toBe("projetos");
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

describe("ideTabs", () => {
  it("mostra só as tabs base em rotas de índice", () => {
    const tabs = ideTabs("/blog");
    expect(tabs).toHaveLength(5);
    expect(tabs.map((tab) => tab.label)).toEqual([
      "home.tsx",
      "blog",
      "projetos",
      "estudos",
      "sobre.md",
    ]);
  });

  it("anexa tab modificada ao abrir um post", () => {
    const tabs = ideTabs("/blog/pipeline-do-blog");
    const deepTab = tabs.at(-1);
    expect(deepTab).toMatchObject({
      href: "/blog/pipeline-do-blog",
      label: "pipeline-do-blog.mdx",
      modified: true,
    });
  });

  it("anexa auth.config em /entrar sem marcador de modificado", () => {
    const deepTab = ideTabs("/entrar").at(-1);
    expect(deepTab).toMatchObject({ label: "auth.config", modified: false });
  });

  it("anexa tab de editor modificada em /admin/editor", () => {
    const deepTab = ideTabs("/admin/editor").at(-1);
    expect(deepTab).toMatchObject({ label: "editor", modified: true });
  });
});
