import { expect, test } from "@playwright/test";

test("explorer navega entre arquivos e tabs refletem a rota", async ({
  page,
}) => {
  await page.goto("/");
  const explorer = page.getByRole("navigation", { name: "principal" });
  await explorer.getByRole("link", { name: "sobre.md" }).click();
  await expect(page).toHaveURL(/\/sobre$/);

  const tabs = page.getByRole("navigation", { name: "abas" });
  await expect(tabs.getByRole("link", { name: "sobre.md" })).toHaveAttribute(
    "aria-current",
    "page",
  );

  await tabs.getByRole("link", { name: "home.tsx" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("abrir um post pelo explorer cria tab modificada com o arquivo", async ({
  page,
}) => {
  await page.goto("/");
  const explorer = page.getByRole("navigation", { name: "principal" });
  await explorer
    .getByRole("link", { name: /\.mdx$/ })
    .first()
    .click();
  await expect(page).toHaveURL(/\/blog\/.+/);

  const activeTab = page
    .getByRole("navigation", { name: "abas" })
    .locator('[aria-current="page"]');
  await expect(activeTab).toContainText(".mdx");
});

test("statusbar mostra branch com link para o repositório", async ({
  page,
}) => {
  await page.goto("/");
  const repoLink = page.getByRole("link", { name: "código no GitHub" });
  await expect(repoLink).toBeVisible();
  await expect(repoLink).toHaveAttribute(
    "href",
    "https://github.com/GabrielBeloDev/portifolio_gabriel",
  );
});

test("pane de conteúdo avança a barra de leitura e reseta o scroll ao navegar", async ({
  page,
}) => {
  await page.goto("/blog/o-pipeline-deste-blog");
  const pane = page.locator("#conteudo");
  await pane.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await expect
    .poll(() => pane.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);

  const progressBar = page.getByTestId("reading-progress").locator("div");
  await expect
    .poll(() => progressBar.evaluate((el) => parseFloat(el.style.height)))
    .toBeGreaterThan(0);

  await page
    .getByRole("navigation", { name: "principal" })
    .getByRole("link", { name: "home.tsx" })
    .click();
  await expect(page).toHaveURL(/\/$/);
  await expect.poll(() => pane.evaluate((el) => el.scrollTop)).toBe(0);
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("drawer abre pelo ☰, navega e fecha", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "abrir explorer" }).click();

    const drawer = page.getByRole("dialog", { name: "explorer" });
    await expect(drawer).toBeVisible();

    await drawer.getByRole("link", { name: "sobre.md" }).click();
    await expect(page).toHaveURL(/\/sobre$/);
    await expect(drawer).toBeHidden();
  });

  test("drawer fecha com Esc devolvendo o foco ao gatilho", async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "abrir explorer" }).click();
    await expect(page.getByRole("dialog", { name: "explorer" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "explorer" })).toBeHidden();
    await expect(
      page.getByRole("button", { name: "abrir explorer" }),
    ).toBeFocused();
  });
});
