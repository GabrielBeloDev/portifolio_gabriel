import { neon } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";

const E2E_EMAIL_PATTERN = "e2e-comments-%@example.com";

// A run that dies mid-test leaves comments/likes behind in the real database;
// sweep every fixture user's data so reruns start from a clean thread
async function purgeCommentFixtures() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) return;
  const sql = neon(databaseUrl);
  await sql`DELETE FROM "like" WHERE reader_id IN (SELECT id FROM "user" WHERE email LIKE ${E2E_EMAIL_PATTERN})`;
  await sql`DELETE FROM "like" WHERE target_type = 'comment' AND target_id IN (SELECT id::text FROM comment WHERE author_id IN (SELECT id FROM "user" WHERE email LIKE ${E2E_EMAIL_PATTERN}))`;
  await sql`DELETE FROM comment WHERE parent_id IS NOT NULL AND author_id IN (SELECT id FROM "user" WHERE email LIKE ${E2E_EMAIL_PATTERN})`;
  await sql`DELETE FROM comment WHERE author_id IN (SELECT id FROM "user" WHERE email LIKE ${E2E_EMAIL_PATTERN})`;
  await sql`DELETE FROM "user" WHERE email LIKE ${E2E_EMAIL_PATTERN}`;
}

// Needs the real database and auth stack — run locally with E2E_WITH_DB=1
test.describe("comentários", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test.beforeAll(purgeCommentFixtures);
  test.afterAll(purgeCommentFixtures);

  const email = `e2e-comments-${process.pid}@example.com`;
  const postUrl = "/blog/o-pipeline-deste-blog";
  const rootComment = `comentário raiz e2e ${process.pid}`;
  const replyComment = `resposta aninhada e2e ${process.pid}`;

  test("fluxo completo: cadastrar, comentar, responder e apagar preservando a thread", async ({
    page,
  }) => {
    await page.goto(postUrl);
    await expect(page.getByText("entre", { exact: false })).toBeVisible();

    await page.goto("/entrar");
    await page.getByRole("tab", { name: "criar conta" }).click();
    await page.getByLabel("nome").fill("Conta E2E");
    await page.getByLabel("email").fill(email);
    await page.getByLabel("senha").fill("senha-de-teste-123");
    await page.getByRole("button", { name: "criar conta" }).click();
    await page.waitForURL("/");

    await page.goto(postUrl);
    await page.getByPlaceholder("seu comentário…").fill(rootComment);
    await page.getByRole("button", { name: "comentar" }).click();
    await expect(page.locator("p", { hasText: rootComment })).toBeVisible();

    // The post is shared state in the real database — assert the increment,
    // not an absolute count, so likes from real users don't break the test
    const postLike = page.getByRole("button", { name: "curtir post" });
    const likesBefore = Number((await postLike.textContent())?.trim());
    await postLike.click();
    await expect(postLike).toHaveText(String(likesBefore + 1));
    await expect(postLike).toHaveAttribute("aria-pressed", "true");

    const commentLike = page
      .getByRole("button", { name: "curtir comentário" })
      .first();
    await commentLike.click();
    await expect(commentLike).toHaveText("1");

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
