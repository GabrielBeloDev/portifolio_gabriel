import { expect, test } from "@playwright/test";

test("a assinatura do rodapé leva ao sobre", async ({ page }) => {
  await page.goto("/");
  const signature = page
    .getByRole("contentinfo")
    .getByRole("link", { name: /escrito e mantido por Gabriel/ });
  await expect(signature).toBeVisible();
  await signature.click();
  await expect(page).toHaveURL(/\/sobre$/);
});
