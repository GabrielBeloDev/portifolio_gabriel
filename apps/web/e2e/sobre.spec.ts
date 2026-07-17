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

test("seções automáticas do sobre.md estão visíveis", async ({ page }) => {
  await page.goto("/sobre");
  const main = page.getByRole("main");

  for (const name of [
    "jornada",
    "domino / aprendendo",
    "este site",
    "me acha em",
  ]) {
    await expect(main.getByRole("heading", { level: 2, name })).toBeVisible();
  }
  // NowPanel brings its own h2 "agora"; the section heading is the first match
  await expect(
    main.getByRole("heading", { level: 2, name: "agora" }).first(),
  ).toBeVisible();

  // The journey always lists locally verifiable milestones (published posts),
  // even when the GitHub API was unreachable at build time
  const journeyPostLinks = await main.locator('a[href^="/blog/"]').count();
  expect(journeyPostLinks).toBeGreaterThanOrEqual(1);

  await expect(
    main.getByText("// usados neste site em produção"),
  ).toBeVisible();
  await expect(main.getByText("// aprendendo agora")).toBeVisible();
  await expect(main.getByText("// sobre o que escrevo")).toBeVisible();
  await expect(main.getByText("posts", { exact: true })).toBeVisible();
  await expect(main.getByText("estudos", { exact: true })).toBeVisible();
});

test("seções que dependem do texto do dono não renderizam", async ({
  page,
}) => {
  await page.goto("/sobre");
  await expect(page.getByText("o que mais me ensinou")).toHaveCount(0);
});
