import { expect, test } from "@playwright/test";

const POST_URL = "/blog/o-pipeline-deste-blog";

test("digitar > troca a lista da palette para ações", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Control+k");

  const palette = page.getByRole("dialog", { name: "buscar" });
  await palette.getByRole("combobox").fill(">");

  await expect(
    palette.getByRole("option", { name: "alternar tema" }),
  ).toBeVisible();
  await expect(palette.getByRole("option", { name: "zen mode" })).toBeVisible();
  await expect(
    palette.getByRole("option", { name: "copiar link desta página" }),
  ).toBeVisible();
  await expect(
    palette.getByRole("option", { name: "abrir /uses" }),
  ).toBeVisible();
  await expect(
    palette.getByRole("option", { name: "abrir dashboard" }),
  ).toBeVisible();
  await expect(
    palette.getByRole("option", { name: /ir para tag:/ }).first(),
  ).toBeVisible();
  await expect(palette.getByRole("option", { name: /home\.tsx/ })).toHaveCount(
    0,
  );
});

test("> alternar tema troca a classe do html e fecha a palette", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.keyboard.press("Control+k");
  const palette = page.getByRole("dialog", { name: "buscar" });
  await palette.getByRole("combobox").fill("> alternar tema");
  await page.keyboard.press("Enter");

  await expect(page.locator("html")).toHaveClass(/light/);
  await expect(palette).toBeHidden();
});

test("Ctrl+Shift+Z entra no zen mode e Esc restaura o chrome", async ({
  page,
}) => {
  await page.goto(POST_URL);
  const explorer = page.getByRole("navigation", { name: "principal" });
  const tabs = page.getByRole("navigation", { name: "abas" });
  await expect(explorer).toBeVisible();
  await expect(tabs).toBeVisible();

  await page.keyboard.press("Control+Shift+Z");
  await expect(explorer).toHaveCount(0);
  await expect(tabs).toHaveCount(0);
  await expect(page.getByRole("button", { name: "sair do zen" })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(explorer).toBeVisible();
  await expect(tabs).toBeVisible();
  await expect(page.getByRole("button", { name: "sair do zen" })).toHaveCount(
    0,
  );
});

test("> zen mode ativa pela palette e o botão da winbar sai", async ({
  page,
}) => {
  await page.goto(POST_URL);
  await page.keyboard.press("Control+k");

  const palette = page.getByRole("dialog", { name: "buscar" });
  await palette.getByRole("combobox").fill("> zen");
  await page.keyboard.press("Enter");

  await expect(page.getByRole("navigation", { name: "principal" })).toHaveCount(
    0,
  );
  await page.getByRole("button", { name: "sair do zen" }).click();
  await expect(
    page.getByRole("navigation", { name: "principal" }),
  ).toBeVisible();
});

test("breadcrumb navega pra um post irmão pelo dropdown", async ({ page }) => {
  await page.goto(POST_URL);

  const breadcrumb = page.getByRole("navigation", { name: "trilha" });
  await expect(breadcrumb).toBeVisible();
  // "blog" is a substring of the sibling file button names; exact avoids both
  await breadcrumb.getByRole("button", { name: "blog", exact: true }).click();

  await page
    .getByRole("menuitem", { name: "transformei-meu-site-num-ide.mdx" })
    .click();
  await expect(page).toHaveURL(/\/blog\/transformei-meu-site-num-ide$/);
});

test("dropdown do arquivo lista os headings do TOC e rola até a seção", async ({
  page,
}) => {
  await page.goto(POST_URL);

  const breadcrumb = page.getByRole("navigation", { name: "trilha" });
  await breadcrumb
    .getByRole("button", { name: "o-pipeline-deste-blog.mdx" })
    .click();

  const firstHeading = page.getByRole("menuitem").first();
  await expect(firstHeading).toBeVisible();
  await firstHeading.click();
  await expect(page).toHaveURL(/#.+/);
});
