import { expect, test } from "@playwright/test";

test("sobre mostra o frontmatter, o hero e a foto", async ({ page }) => {
  await page.goto("/sobre");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Oi, eu sou o Gabriel.",
  );
  await expect(page.getByText("nome: Gabriel Belo")).toBeVisible();
  await expect(
    page.getByText('foco: "infra moderna: Kubernetes · Terraform"'),
  ).toBeVisible();
  await expect(
    page.getByRole("main").getByRole("img", { name: "Gabriel Belo" }),
  ).toBeVisible();
});

test("as seções do sobre.md estão visíveis", async ({ page }) => {
  await page.goto("/sobre");
  const main = page.getByRole("main");

  for (const name of [
    "trajetória",
    "no que trabalho hoje",
    "projetos que me formaram",
    "domino / aprendendo",
    "como penso sobre software",
    "errar e ouvir",
    "este site",
    "fora do código",
    "me acha em",
  ]) {
    await expect(main.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  // NowPanel brings its own h2 "agora"; the section heading is the first match
  await expect(
    main.getByRole("heading", { level: 2, name: "agora" }).first(),
  ).toBeVisible();
});

test("conteúdo pessoal e widgets automáticos aparecem", async ({ page }) => {
  await page.goto("/sobre");
  const main = page.getByRole("main");

  // Career timeline years and formative projects (owner-provided content)
  await expect(main.getByText("2022", { exact: true })).toBeVisible();
  await expect(main.getByText("Cosmo", { exact: true })).toBeVisible();
  await expect(main.getByText("Reapp", { exact: true })).toBeVisible();

  // Skills panel still pulls the live GitHub language bars and site stats
  await expect(
    main.getByText("// usados neste site em produção"),
  ).toBeVisible();
  await expect(main.getByText("// aprendendo agora")).toBeVisible();
  await expect(main.getByText("// sobre o que escrevo")).toBeVisible();
  await expect(main.getByText("posts", { exact: true })).toBeVisible();
  await expect(main.getByText("estudos", { exact: true })).toBeVisible();
});
