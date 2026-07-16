import { expect, test, type Page } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

const outline = (page: Page) =>
  page.getByRole("navigation", { name: "outline do post" });

test("outline aparece no desktop com as seções do post", async ({ page }) => {
  await page.goto("/blog/o-pipeline-deste-blog");

  await expect(outline(page)).toBeVisible();
  await expect(
    outline(page).getByRole("link", { name: "Frontmatter com contrato" }),
  ).toBeVisible();
  await expect(
    outline(page).getByRole("link", { name: "Diagramas como texto" }),
  ).toBeVisible();
});

test("clicar numa seção do outline navega para a âncora", async ({ page }) => {
  await page.goto("/blog/o-pipeline-deste-blog");

  await outline(page)
    .getByRole("link", { name: "Diagramas como texto" })
    .click();

  await expect(page).toHaveURL(/#diagramas-como-texto$/);
  await expect(page.locator("#diagramas-como-texto")).toBeInViewport();
});

test("seção ativa fica marcada no outline após o scroll", async ({ page }) => {
  await page.goto("/blog/o-pipeline-deste-blog");

  const activeLink = outline(page).getByRole("link", {
    name: "Diagramas como texto",
  });

  // The pane resets its scroll when React mounts, so a single scroll issued
  // before hydration would be swallowed — keep scrolling until the observer
  // marks the section as active
  await expect
    .poll(async () => {
      await page.evaluate(() => {
        document.getElementById("diagramas-como-texto")?.scrollIntoView();
      });
      return activeLink.getAttribute("aria-current");
    })
    .toBe("true");
  await expect(activeLink).toHaveClass(/text-accent/);
});
