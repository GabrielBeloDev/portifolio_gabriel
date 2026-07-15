import { expect, test } from "@playwright/test";

test("home apresenta o dono e as três seções", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1, name: "Gabriel Belo" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "escritos" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "trabalhos" })).toBeVisible();
  await expect(page.getByRole("heading", { level: 2, name: "estudos" })).toBeVisible();
});

test("navega da home até um post com código destacado", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "todos os escritos →" }).click();
  await expect(page).toHaveURL(/\/blog$/);

  await page.getByRole("link", { name: /O pipeline deste blog/ }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText("pipeline");

  const highlightedCode = page.locator("[data-rehype-pretty-code-figure] code span[style]").first();
  await expect(highlightedCode).toBeVisible();
});

test("estudo com trabalho vinculado mostra o link do projeto", async ({ page }) => {
  await page.goto("/estudos/como-construi-este-site");
  await expect(page.getByRole("link", { name: /Este site/ })).toBeVisible();
});

test("estudo independente não mostra bloco de projeto", async ({ page }) => {
  await page.goto("/estudos/fugindo-da-cara-de-ia");
  await expect(page.getByText("sobre o trabalho:")).toHaveCount(0);
});

test("theme toggle alterna para dark", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Trocar tema" }).click();
  await page.getByRole("menuitemradio", { name: /dark/ }).click();
  await expect(page.locator("html")).toHaveClass(/dark/);
});

test("skip link leva o foco ao conteúdo", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "pular para o conteúdo" })).toBeFocused();
});
