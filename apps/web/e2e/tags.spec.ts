import { expect, test } from "@playwright/test";

test("clicar na tag do post leva à página da tag com o post listado", async ({
  page,
}) => {
  await page.goto("/blog/o-pipeline-deste-blog");
  await page.getByRole("link", { name: "mdx", exact: true }).click();

  await expect(page).toHaveURL(/\/blog\/tag\/mdx$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("mdx");
  await expect(
    page.getByRole("link", { name: /O pipeline deste blog/ }),
  ).toBeVisible();
});

test("tag inexistente responde 404", async ({ page }) => {
  const response = await page.goto("/blog/tag/tag-que-nao-existe");
  expect(response?.status()).toBe(404);
});
