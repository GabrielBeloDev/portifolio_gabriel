import { expect, test } from "@playwright/test";

// No DB needed: the search box just opens the client-side palette
test.describe("busca visível no blog", () => {
  test("o campo de busca do blog abre o palette", async ({ page }) => {
    await page.goto("/blog");
    await expect(page.getByRole("dialog", { name: "buscar" })).toHaveCount(0);

    await page.getByRole("button", { name: "buscar posts" }).click();
    await expect(page.getByRole("dialog", { name: "buscar" })).toBeVisible();

    // The palette really searches: a body-only term still finds a post
    await page.getByRole("combobox").fill("terminal");
    await expect(page.getByRole("option").first()).toBeVisible();
  });
});
