import { neon } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";

const email = `e2e-comments-${process.pid}@example.com`;
const E2E_EMAIL_PATTERN = "e2e-comments-%@example.com";

function requireDb() {
  const databaseUrl = process.env.DATABASE_URL;
  // This hook only runs with E2E_WITH_DB=1, so a missing URL is always
  // misconfiguration — failing loud beats a silent no-op sweep
  if (!databaseUrl) {
    throw new Error("E2E_WITH_DB=1 requer DATABASE_URL para o sweep de fixtures");
  }
  return neon(databaseUrl);
}

async function purgeFixtureUsers(userIds: string[]) {
  if (userIds.length === 0) return;
  const sql = requireDb();
  await sql`DELETE FROM "like" WHERE reader_id = ANY(${userIds})`;
  await sql`DELETE FROM "like" WHERE target_type = 'comment' AND target_id IN (SELECT id::text FROM comment WHERE author_id = ANY(${userIds}))`;
  await sql`DELETE FROM comment WHERE parent_id IS NOT NULL AND author_id = ANY(${userIds})`;
  await sql`DELETE FROM comment WHERE author_id = ANY(${userIds})`;
  await sql`DELETE FROM "user" WHERE id = ANY(${userIds})`;
}

// A run that dies mid-test leaves data behind in the real database. The sweep
// targets this run's exact email plus fixtures older than an hour — never a
// live wildcard, so concurrent runs and any real user stay untouched
async function purgeStaleFixtures() {
  const sql = requireDb();
  const fixtureUsers = await sql`SELECT id FROM "user" WHERE email = ${email} OR (email LIKE ${E2E_EMAIL_PATTERN} AND created_at < now() - interval '1 hour')`;
  await purgeFixtureUsers(fixtureUsers.map((row) => String(row.id)));
}

async function purgeThisRun() {
  const sql = requireDb();
  const runUsers = await sql`SELECT id FROM "user" WHERE email = ${email}`;
  await purgeFixtureUsers(runUsers.map((row) => String(row.id)));
}

// Needs the real database and auth stack — run locally with E2E_WITH_DB=1
test.describe("comentários", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test.beforeAll(purgeStaleFixtures);
  test.afterAll(purgeThisRun);

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
    expect(Number.isFinite(likesBefore), "contador de likes deve ser um número").toBe(true);
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
