import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 1440, height: 900 } });

test("deep-link de âncora rola o pane até a seção", async ({ page }) => {
  await page.goto("/blog/o-pipeline-deste-blog#frontmatter-com-contrato");

  const heading = page.locator('[id="frontmatter-com-contrato"]');
  await expect(heading).toBeAttached();

  // Hydration re-runs the pane scroll effect and smooth scroll animates, so
  // poll until the anchor lands inside the viewport instead of asserting once
  const pane = page.locator("#conteudo");
  await expect
    .poll(async () => {
      const box = await heading.boundingBox();
      const viewport = page.viewportSize();
      if (!box || !viewport) return false;
      return box.y >= 0 && box.y < viewport.height;
    })
    .toBe(true);
  await expect
    .poll(() => pane.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(0);
});

// The unauthenticated GitHub API can be rate-limited on CI, so the revisions
// section is allowed to be absent — when present, every entry must link to a
// commit on GitHub
test("seção de revisões, quando presente, linka commits do GitHub", async ({
  page,
}) => {
  await page.goto("/blog/o-pipeline-deste-blog");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const history = page.locator("details", {
    hasText: "revisões deste arquivo",
  });
  const historyIsPresent = (await history.count()) > 0;
  if (!historyIsPresent) return;

  await history.locator("summary").click();
  const commitLinks = history.getByRole("link");
  const commitLinkCount = await commitLinks.count();
  expect(commitLinkCount).toBeGreaterThan(0);
  for (let index = 0; index < commitLinkCount; index++) {
    await expect(commitLinks.nth(index)).toHaveAttribute(
      "href",
      /github\.com\/.+\/commit\//,
    );
  }
});
