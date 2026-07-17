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

  // The outline urls (velite s.toc) and the heading ids (rehype-slug) come
  // from independent pipelines — every anchor must resolve to a real heading
  const anchorIds = await outline(page)
    .getByRole("link")
    .evaluateAll((links) =>
      links.map((link) => link.getAttribute("href")?.slice(1) ?? ""),
    );
  expect(anchorIds.length).toBeGreaterThan(0);
  for (const anchorId of anchorIds) {
    await expect(page.locator(`[id="${anchorId}"]`)).toBeAttached();
  }
});

test("post sem seções não mostra outline", async ({ page }) => {
  await page.goto("/blog/adrs-num-projeto-solo");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(outline(page)).toHaveCount(0);
});

// Asserting that a specific post has ZERO related entries couples the test to
// editorial state (any future post sharing a tag breaks CI); assert the
// behavioral invariants instead: never lists itself, never more than 3
test("relacionados nunca inclui o próprio post e mostra no máximo 3", async ({
  page,
}) => {
  await page.goto("/blog/o-pipeline-deste-blog");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const relatedSection = page.getByText("// relacionados");
  const sectionCount = await relatedSection.count();
  if (sectionCount === 0) return;

  const relatedLinks = page
    .locator("section", { has: relatedSection })
    .locator('a[href^="/blog/"]');
  const hrefs = await relatedLinks.evaluateAll((links) =>
    links.map((link) => link.getAttribute("href")),
  );
  expect(hrefs.length).toBeLessThanOrEqual(3);
  expect(hrefs).not.toContain("/blog/o-pipeline-deste-blog");
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

  const heading = page.locator('[id="código-com-a-cara-da-casa"]');
  await expect(heading).toBeAttached();

  // A middle section always has a full section below it, so it can always
  // reach the top band of the pane — the last one can't when the page tail
  // is short (e.g. no comments on CI)
  const activeLink = outline(page).getByRole("link", {
    name: "Código com a cara da casa",
  });

  // The pane resets its scroll when React mounts, so a single scroll issued
  // before hydration would be swallowed — keep scrolling until the observer
  // marks the section as active
  await expect
    .poll(async () => {
      await heading.evaluate((el) => el.scrollIntoView());
      return activeLink.getAttribute("aria-current");
    })
    .toBe("location");
});

test.describe("mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("outline colapsável abre e navega para a seção", async ({ page }) => {
    await page.goto("/blog/o-pipeline-deste-blog");

    await page.locator("summary").click();
    await outline(page)
      .getByRole("link", { name: "Diagramas como texto" })
      .click();

    await expect(page).toHaveURL(/#diagramas-como-texto$/);
    await expect(page.locator("#diagramas-como-texto")).toBeInViewport();
  });
});
