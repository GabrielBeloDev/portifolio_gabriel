import { neon } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";

const email = `e2e-reactions-${process.pid}@example.com`;
const E2E_EMAIL_PATTERN = "e2e-reactions-%@example.com";

function requireDb() {
  const databaseUrl = process.env.DATABASE_URL;
  // This hook only runs with E2E_WITH_DB=1, so a missing URL is always
  // misconfiguration — failing loud beats a silent no-op sweep
  if (!databaseUrl) {
    throw new Error("E2E_WITH_DB=1 requer DATABASE_URL para o sweep de fixtures");
  }
  return neon(databaseUrl);
}

// This spec creates no comments, so reactions vanish with the reader rows
async function purgeFixtureUsers(userIds: string[]) {
  if (userIds.length === 0) return;
  const sql = requireDb();
  await sql`DELETE FROM "like" WHERE reader_id = ANY(${userIds})`;
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

function reactionCount(text: string | null): number {
  return Number(/\((\d+)\)/.exec(text ?? "")?.[1]);
}

// Needs the real database and auth stack — run locally with E2E_WITH_DB=1
test.describe("reações em posts", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test.beforeAll(purgeStaleFixtures);
  test.afterAll(purgeThisRun);

  const postUrl = "/blog/transformei-meu-site-num-ide";

  test("logado reage útil e desreage; deslogado vê convite de login", async ({
    page,
  }) => {
    test.setTimeout(120_000);

    // Signed out, reactions are login invites — links, not buttons
    await page.goto(postUrl);
    await expect(
      page.getByRole("link", { name: "reagir útil (requer login)" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "reagir útil" })).toHaveCount(0);

    // better-auth caps /sign-up/email at 3 requests per 10s per IP; the other
    // db-backed specs stagger their signups at 0s/15s/30s/45s/60s — this spec
    // takes a fresh 75s slot so its signup never competes for that budget
    await page.waitForTimeout(75_000);

    await page.goto("/entrar");
    await page.getByRole("tab", { name: "criar conta" }).click();
    await page.getByLabel("nome").fill("Reator E2E");
    await page.getByLabel("email").fill(email);
    await page.getByLabel("senha").fill("senha-de-teste-123");
    await page.getByRole("button", { name: "criar conta" }).click();
    await page.waitForURL("/");

    await page.goto(postUrl);
    const utilButton = page.getByRole("button", { name: "reagir útil" });
    await expect(utilButton).toBeVisible();

    // The post is shared state in the real database — assert the increment,
    // not an absolute count, so reactions from real users don't break the test
    const countBefore = reactionCount(await utilButton.textContent());
    expect(
      Number.isFinite(countBefore),
      "contador de reações deve ser um número",
    ).toBe(true);

    // The optimistic UI updates before the server action commits; reloading
    // too early would read the pre-insert count, so wait for the POST to settle
    const toggleSettled = page.waitForResponse(
      (response) => response.request().method() === "POST",
    );
    await utilButton.click();
    await expect(utilButton).toHaveText(`útil (${countBefore + 1})`);
    await expect(utilButton).toHaveAttribute("aria-pressed", "true");
    await toggleSettled;

    // Reload proves persistence beyond the optimistic state
    await page.reload();
    const utilAfterReload = page.getByRole("button", { name: "reagir útil" });
    await expect(utilAfterReload).toHaveText(`útil (${countBefore + 1})`);
    await expect(utilAfterReload).toHaveAttribute("aria-pressed", "true");

    await utilAfterReload.click();
    await expect(utilAfterReload).toHaveText(`útil (${countBefore})`);
    await expect(utilAfterReload).toHaveAttribute("aria-pressed", "false");
  });
});
