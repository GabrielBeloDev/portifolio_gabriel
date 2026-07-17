import { expect, test } from "@playwright/test";

test("frame do stack trace do 404 navega para a rota real", async ({
  page,
}) => {
  const response = await page.goto("/rota-que-nao-existe");
  expect(response?.status()).toBe(404);

  await expect(
    page.getByText("Uncaught RouteNotFoundError: arquivo não encontrado"),
  ).toBeVisible();

  await page.getByRole("link", { name: "at blog/index.tsx:1" }).click();
  await expect(page).toHaveURL(/\/blog$/);
});
