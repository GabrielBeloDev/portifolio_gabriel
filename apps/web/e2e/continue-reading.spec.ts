import { expect, test } from "@playwright/test";

const POST_SLUG = "transformei-meu-site-num-ide";
const POST_PATH = `/blog/${POST_SLUG}`;
const STORAGE_KEY = `reading:${POST_SLUG}`;

test.use({ viewport: { width: 1440, height: 900 } });

test("post começado ganha o dot no explorer e retoma a posição", async ({
  page,
}) => {
  await page.goto(POST_PATH);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const pane = page.locator("#conteudo");
  await pane.evaluate((el) => el.scrollTo(0, 1500));

  // The position is persisted ~2s after the scroll goes idle
  await expect
    .poll(
      () =>
        page.evaluate(
          (key) => window.localStorage.getItem(key) !== null,
          STORAGE_KEY,
        ),
      { timeout: 6_000 },
    )
    .toBe(true);

  await page.goto("/");
  const explorerPostLink = page.locator(
    `nav[aria-label="principal"] a[href="${POST_PATH}"]`,
  );
  const dot = explorerPostLink.locator('[title="leitura em andamento"]');
  await expect(dot).toBeVisible();

  // toBeVisible ignores overflow clipping — the truncated slug must not push
  // the dot past the link's clip edge
  const dotBox = await dot.boundingBox();
  const linkBox = await explorerPostLink.boundingBox();
  if (!dotBox || !linkBox) throw new Error("dot ou link sem bounding box");
  expect(dotBox.x + dotBox.width).toBeLessThanOrEqual(
    linkBox.x + linkBox.width,
  );

  await explorerPostLink.click();
  await expect(page).toHaveURL(POST_PATH);
  await expect(page.getByText("retomando de onde você parou")).toBeVisible();
  await expect
    .poll(() => pane.evaluate((el) => el.scrollTop))
    .toBeGreaterThan(600);

  await pane.evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await expect
    .poll(
      () =>
        page.evaluate((key) => window.localStorage.getItem(key), STORAGE_KEY),
      { timeout: 6_000 },
    )
    .toBeNull();
  await expect(dot).toHaveCount(0);
});
