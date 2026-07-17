import { expect, test } from "@playwright/test";
import {
  ADMIN_EMAIL,
  ADMIN_STATE,
  READER_STATE,
  requireDb,
} from "./fixtures";

const postSlug = "adrs-num-projeto-solo";

// Needs the real database and auth stack — run locally with E2E_WITH_DB=1
test.describe("report e moderação de comentários", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  // The comment author is the admin fixture: the reader fixture already
  // comments in comments.spec, and a second same-author comment inside the
  // 15s cooldown would reject whichever spec posts last
  test.use({ storageState: ADMIN_STATE });

  const postUrl = `/blog/${postSlug}`;
  const rootComment = `comentário reportável e2e ${process.pid}`;

  // The soft-deleted row survives the in-test moderation, so the purge removes
  // this spec's comment on its own post — never the shared fixture users
  test.afterAll(async () => {
    const sql = requireDb();
    await sql`DELETE FROM comment WHERE post_slug = ${postSlug} AND author_id IN (SELECT id FROM "user" WHERE email = ${ADMIN_EMAIL})`;
  });

  test("leitor reporta comentário alheio e admin modera na fila cross-post", async ({
    page,
    browser,
  }) => {
    await page.goto(postUrl);
    await page.getByPlaceholder("seu comentário…").fill(rootComment);
    await page.getByRole("button", { name: "comentar" }).click();

    // "apagar" proves the row rendered its action buttons, so the missing
    // "reportar" is a real rule (no self-report), not an unrendered state
    const ownRow = page.locator("li", { hasText: rootComment });
    await expect(ownRow.getByRole("button", { name: "apagar" })).toBeVisible();
    await expect(ownRow.getByRole("button", { name: "reportar" })).toHaveCount(0);

    const reporterContext = await browser.newContext({
      storageState: READER_STATE,
    });
    const reporterPage = await reporterContext.newPage();

    await reporterPage.goto(postUrl);
    const reportableRow = reporterPage.locator("li", { hasText: rootComment });
    await reportableRow.getByRole("button", { name: "reportar" }).click();
    await expect(reportableRow.getByText("reportado ✓")).toBeVisible();

    await page.goto("/admin");
    await expect(page.getByText("1 reportado", { exact: true })).toBeVisible();
    await page.getByRole("link", { name: /comentários/ }).click();
    await page.waitForURL("/admin/comentarios");

    const queueRow = page.locator("li", { hasText: rootComment });
    await expect(queueRow.getByText("reportado", { exact: true })).toBeVisible();

    // Reported comments jump the queue regardless of post or age
    const queue = page
      .locator("ul", { has: page.locator("li", { hasText: rootComment }) })
      .locator("> li");
    await expect(queue.first()).toContainText(rootComment);

    await queueRow.getByRole("button", { name: "ignorar report" }).click();
    await expect(queueRow.getByText("reportado", { exact: true })).toHaveCount(0);
    await expect(queueRow).toBeVisible();

    await queueRow.getByRole("button", { name: "apagar" }).click();
    await expect(queueRow).toHaveCount(0);

    await reporterPage.goto(postUrl);
    await expect(reporterPage.getByText("[removido]")).toBeVisible();

    await reporterContext.close();
  });
});
