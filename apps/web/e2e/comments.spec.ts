import { expect, test } from "@playwright/test";
import {
  ANONYMOUS_STATE,
  READER_EMAIL,
  READER_STATE,
  requireDb,
} from "./fixtures";

const postSlug = "o-pipeline-deste-blog";

// Needs the real database and auth stack — run locally with E2E_WITH_DB=1
test.describe("comentários", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test.use({ storageState: READER_STATE });

  const postUrl = `/blog/${postSlug}`;
  const rootComment = `comentário raiz e2e ${process.pid}`;
  const replyComment = `resposta aninhada e2e ${process.pid}`;

  // The shared reader fixture outlives this spec, so the purge removes only
  // the data this spec creates on its own post — never the user
  test.afterAll(async () => {
    const sql = requireDb();
    await sql`DELETE FROM "like" WHERE target_type = 'comment' AND target_id IN (SELECT id::text FROM comment WHERE post_slug = ${postSlug} AND author_id IN (SELECT id FROM "user" WHERE email = ${READER_EMAIL}))`;
    await sql`DELETE FROM comment WHERE post_slug = ${postSlug} AND parent_id IS NOT NULL AND author_id IN (SELECT id FROM "user" WHERE email = ${READER_EMAIL})`;
    await sql`DELETE FROM comment WHERE post_slug = ${postSlug} AND author_id IN (SELECT id FROM "user" WHERE email = ${READER_EMAIL})`;
    await sql`DELETE FROM "like" WHERE target_type = 'post' AND target_id = ${postSlug} AND reader_id IN (SELECT id FROM "user" WHERE email = ${READER_EMAIL})`;
  });

  test("fluxo completo: comentar, responder e apagar preservando a thread", async ({
    page,
    browser,
  }) => {
    const anonContext = await browser.newContext({
      storageState: ANONYMOUS_STATE,
    });
    const anonPage = await anonContext.newPage();
    await anonPage.goto(postUrl);
    await expect(anonPage.getByText("entre", { exact: false })).toBeVisible();
    await anonContext.close();

    await page.goto(postUrl);
    await page.getByPlaceholder("seu comentário…").fill(rootComment);
    await page.getByRole("button", { name: "comentar" }).click();
    await expect(page.locator("p", { hasText: rootComment })).toBeVisible();

    // The post is shared state in the real database — assert the increment,
    // not an absolute count, so likes from real users don't break the test
    const postLike = page.getByRole("button", { name: "curtir post" });
    const likesBefore = Number((await postLike.textContent())?.trim());
    expect(Number.isFinite(likesBefore), "contador de likes deve ser um número").toBe(true);

    // The optimistic UI updates before the server action commits; reloading
    // too early would read the pre-insert count, so wait for the POST to settle
    const postLikeSettled = page.waitForResponse(
      (response) => response.request().method() === "POST",
    );
    await postLike.click();
    await expect(postLike).toHaveText(String(likesBefore + 1));
    await expect(postLike).toHaveAttribute("aria-pressed", "true");
    await postLikeSettled;

    const commentLike = page
      .getByRole("button", { name: "curtir comentário" })
      .first();
    const commentLikeSettled = page.waitForResponse(
      (response) => response.request().method() === "POST",
    );
    await commentLike.click();
    await expect(commentLike).toHaveText("1");
    await commentLikeSettled;

    // Reload proves persistence beyond the optimistic state
    await page.reload();
    await expect(
      page.getByRole("button", { name: "curtir post" }),
    ).toHaveAttribute("aria-pressed", "true");

    // Same-author cooldown between comments is 15s by design
    await page.waitForTimeout(15_500);

    await page.getByRole("button", { name: "responder" }).first().click();
    await page.getByPlaceholder("sua resposta…").fill(replyComment);
    await page.getByRole("button", { name: "responder" }).last().click();
    await expect(page.locator("p", { hasText: replyComment })).toBeVisible();

    await page.getByRole("button", { name: "apagar" }).first().click();
    await expect(page.getByText("[removido]")).toBeVisible();
    await expect(page.locator("p", { hasText: replyComment })).toBeVisible();
  });
});
