import { expect, test } from "@playwright/test";

// VS Code style shortcuts on the shell. No DB needed.
test.describe("atalhos do teclado", () => {
  test("Ctrl+J alterna o terminal", async ({ page }) => {
    await page.goto("/");
    const terminal = page.getByRole("region", { name: "terminal" });
    await page.keyboard.press("Control+KeyJ");
    await expect(terminal).toBeVisible();
    await page.keyboard.press("Control+KeyJ");
    await expect(terminal).toBeHidden();
  });

  test("Ctrl+B alterna a barra lateral", async ({ page }) => {
    await page.goto("/");
    const explorer = page.getByRole("navigation", { name: "principal" });
    await expect(explorer).toBeVisible();
    await page.keyboard.press("Control+KeyB");
    await expect(explorer).toBeHidden();
    await page.keyboard.press("Control+KeyB");
    await expect(explorer).toBeVisible();
  });
});
