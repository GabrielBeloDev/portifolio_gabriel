import { neon } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";

const authorEmail = `e2e-report-author-${process.pid}@example.com`;
const reporterEmail = `e2e-report-reporter-${process.pid}@example.com`;
const E2E_EMAIL_PATTERN = "e2e-report-%@example.com";

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
// targets this run's exact emails plus fixtures older than an hour — never a
// live wildcard, so concurrent runs and any real user stay untouched
async function purgeStaleFixtures() {
  const sql = requireDb();
  const fixtureUsers = await sql`SELECT id FROM "user" WHERE email IN (${authorEmail}, ${reporterEmail}) OR (email LIKE ${E2E_EMAIL_PATTERN} AND created_at < now() - interval '1 hour')`;
  await purgeFixtureUsers(fixtureUsers.map((row) => String(row.id)));
}

async function purgeThisRun() {
  const sql = requireDb();
  const runUsers = await sql`SELECT id FROM "user" WHERE email IN (${authorEmail}, ${reporterEmail})`;
  await purgeFixtureUsers(runUsers.map((row) => String(row.id)));
}

// Needs the real database and auth stack — run locally with E2E_WITH_DB=1
test.describe("report e moderação de comentários", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test.beforeAll(purgeStaleFixtures);
  test.afterAll(purgeThisRun);

  const postUrl = "/blog/adrs-num-projeto-solo";
  const rootComment = `comentário reportável e2e ${process.pid}`;

  test("leitor reporta comentário alheio e admin modera na fila cross-post", async ({
    page,
    browser,
  }) => {
    test.setTimeout(90_000);

    // better-auth caps /sign-up/email at 3 requests per 10s per IP, and the
    // other db-backed specs burn exactly that budget at run start — wait out
    // the window so this spec's two signups don't 429 anyone
    await page.waitForTimeout(15_000);

    await page.goto("/entrar");
    await page.getByRole("tab", { name: "criar conta" }).click();
    await page.getByLabel("nome").fill("Autora E2E");
    await page.getByLabel("email").fill(authorEmail);
    await page.getByLabel("senha").fill("senha-de-teste-123");
    await page.getByRole("button", { name: "criar conta" }).click();
    await page.waitForURL("/");

    await page.goto(postUrl);
    await page.getByPlaceholder("seu comentário…").fill(rootComment);
    await page.getByRole("button", { name: "comentar" }).click();

    // "apagar" proves the row rendered its action buttons, so the missing
    // "reportar" is a real rule (no self-report), not an unrendered state
    const ownRow = page.locator("li", { hasText: rootComment });
    await expect(ownRow.getByRole("button", { name: "apagar" })).toBeVisible();
    await expect(ownRow.getByRole("button", { name: "reportar" })).toHaveCount(0);

    const reporterContext = await browser.newContext();
    const reporterPage = await reporterContext.newPage();

    await reporterPage.goto("/entrar");
    await reporterPage.getByRole("tab", { name: "criar conta" }).click();
    await reporterPage.getByLabel("nome").fill("Reporter E2E");
    await reporterPage.getByLabel("email").fill(reporterEmail);
    await reporterPage.getByLabel("senha").fill("senha-de-teste-123");
    await reporterPage.getByRole("button", { name: "criar conta" }).click();
    await reporterPage.waitForURL("/");

    await reporterPage.goto(postUrl);
    const reportableRow = reporterPage.locator("li", { hasText: rootComment });
    await reportableRow.getByRole("button", { name: "reportar" }).click();
    await expect(reportableRow.getByText("reportado ✓")).toBeVisible();

    const sql = requireDb();
    await sql`UPDATE "user" SET role = 'admin' WHERE email = ${reporterEmail}`;

    // Re-login so the session reflects the promoted role
    await reporterPage.getByRole("button", { name: "sair" }).click();
    await reporterPage.goto("/entrar");
    await reporterPage.getByLabel("email").fill(reporterEmail);
    await reporterPage.getByLabel("senha").fill("senha-de-teste-123");
    await reporterPage.getByRole("button", { name: "entrar", exact: true }).click();
    await reporterPage.waitForURL("/");

    await reporterPage.goto("/admin");
    await expect(reporterPage.getByText("1 reportado", { exact: true })).toBeVisible();
    await reporterPage.getByRole("link", { name: /comentários/ }).click();
    await reporterPage.waitForURL("/admin/comentarios");

    const queueRow = reporterPage.locator("li", { hasText: rootComment });
    await expect(queueRow.getByText("reportado", { exact: true })).toBeVisible();

    // Reported comments jump the queue regardless of post or age
    const queue = reporterPage
      .locator("ul", { has: reporterPage.locator("li", { hasText: rootComment }) })
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
