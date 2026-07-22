import { expect, test } from "@playwright/test";

const HINT_TEXT = "⌘K abre a busca e os comandos";

// No DB needed: the hint is client-side and keyed on localStorage
test.describe("dica de onboarding", () => {
  test("aparece na primeira visita e não volta depois", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText(HINT_TEXT)).toBeVisible({ timeout: 5000 });

    // The seen flag persists, so a reload in the same context stays quiet
    await page.reload();
    await expect(page.getByText(HINT_TEXT)).toHaveCount(0);
  });
});
