import { expect, test } from "@playwright/test";

const DOTFILE_NAMES = [
  "hardware.json",
  "stack.json",
  "tools.txt",
  "site.config",
];

test("/uses renderiza a pasta .dotfiles com os arquivos de config", async ({
  page,
}) => {
  await page.goto("/uses");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    ".dotfiles",
  );

  const main = page.getByRole("main");
  for (const filename of DOTFILE_NAMES) {
    await expect(
      main.locator("[data-rehype-pretty-code-title]", { hasText: filename }),
    ).toBeVisible();
  }

  const highlightedCode = main
    .locator("[data-rehype-pretty-code-figure] code span[style]")
    .first();
  await expect(highlightedCode).toBeVisible();
});

test("explorer abre o grupo .dotfiles e navega até um arquivo", async ({
  page,
}) => {
  await page.goto("/");
  const explorer = page.getByRole("navigation", { name: "principal" });
  await expect(
    explorer.getByRole("button", { name: ".dotfiles" }),
  ).toBeVisible();

  await explorer.getByRole("link", { name: "stack.json" }).click();
  await expect(page).toHaveURL(/\/uses#stack-json$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    ".dotfiles",
  );
  await expect(
    page
      .getByRole("main")
      .locator("[data-rehype-pretty-code-title]", { hasText: "stack.json" }),
  ).toBeVisible();
});
