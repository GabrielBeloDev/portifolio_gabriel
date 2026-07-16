import { expect, test } from "@playwright/test";

test("Ctrl+K abre o palette e Enter navega pra rota filtrada", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");

  const palette = page.getByRole("dialog", { name: "buscar" });
  await expect(palette).toBeVisible();

  await palette.getByRole("combobox").fill("sobre");
  await expect(palette.getByRole("option", { name: /sobre\.md/ })).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/sobre$/);
  await expect(palette).toBeHidden();
});

test("busca fuzzy acha post pelo título e navega ao clicar", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");

  const palette = page.getByRole("dialog", { name: "buscar" });
  await palette.getByRole("combobox").fill("pipeline");
  await palette.getByRole("option", { name: /pipeline/i }).click();

  await expect(page).toHaveURL(/\/blog\/o-pipeline-deste-blog$/);
  await expect(palette).toBeHidden();
});

test("estudos publicados aparecem no palette e navegam", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");

  const palette = page.getByRole("dialog", { name: "buscar" });
  await palette.getByRole("combobox").fill("como construí");
  await expect(
    palette.getByRole("option", { name: /como construí este site/i }),
  ).toBeVisible();

  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/estudos\/como-construi-este-site$/);
});

test("hint da winbar abre o palette e Esc fecha", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "buscar" }).click();

  const palette = page.getByRole("dialog", { name: "buscar" });
  await expect(palette).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(palette).toBeHidden();
});

test("Ctrl+K com o palette aberto fecha de volta (toggle)", async ({
  page,
}) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");
  const palette = page.getByRole("dialog", { name: "buscar" });
  await expect(palette).toBeVisible();

  await page.keyboard.press("Control+k");
  await expect(palette).toBeHidden();
});

test("filtro sem resultado mostra estado vazio", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");

  const palette = page.getByRole("dialog", { name: "buscar" });
  await palette.getByRole("combobox").fill("zzzzzz");
  await expect(palette.getByText("nenhum resultado")).toBeVisible();
  await expect(palette.getByRole("option")).toHaveCount(0);
});
