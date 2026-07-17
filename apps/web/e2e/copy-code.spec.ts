import { expect, test } from "@playwright/test";

const CODE_FIGURE = "figure[data-rehype-pretty-code-figure]";

test("todos os code blocks do post têm o botão de copiar", async ({ page }) => {
  await page.goto("/blog/o-pipeline-deste-blog");

  const figureCount = await page.locator(CODE_FIGURE).count();
  expect(figureCount).toBeGreaterThan(0);
  await expect(page.getByRole("button", { name: "copiar código" })).toHaveCount(
    figureCount,
  );
});

test("copiar coloca o código puro no clipboard e mostra feedback", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/blog/o-pipeline-deste-blog");

  const firstFigure = page.locator(CODE_FIGURE).first();
  const copyButton = firstFigure.getByRole("button", {
    name: "copiar código",
  });
  await copyButton.click();

  await expect(copyButton).toHaveText("copiado ✓");

  const expectedCode = await firstFigure.locator("pre").textContent();
  const clipboardText = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );
  expect(clipboardText).toBe(expectedCode);
});
