import { test as setup } from "@playwright/test";
import {
  ADMIN_EMAIL,
  ADMIN_STATE,
  FIXTURE_PASSWORD,
  READER_EMAIL,
  READER_STATE,
  requireDb,
} from "./fixtures";

// The purge targets this suite's exact fixture emails plus e2e leftovers older
// than an hour — never a live wildcard, so concurrent runs and any real user
// stay untouched
async function purgeFixtureData() {
  const sql = requireDb();
  const fixtureUsers = await sql`
    SELECT id FROM "user"
    WHERE email IN (${READER_EMAIL}, ${ADMIN_EMAIL})
       OR (email LIKE 'e2e-%@example.com' AND created_at < now() - interval '1 hour')
  `;
  const userIds = fixtureUsers.map((row) => String(row.id));
  if (userIds.length === 0) return;
  await sql`DELETE FROM "like" WHERE target_type = 'comment' AND target_id IN (SELECT id::text FROM comment WHERE author_id = ANY(${userIds}))`;
  await sql`DELETE FROM comment WHERE parent_id IS NOT NULL AND author_id = ANY(${userIds})`;
  await sql`DELETE FROM comment WHERE author_id = ANY(${userIds})`;
  // Likes, drafts, sessions and accounts cascade with the user rows
  await sql`DELETE FROM "user" WHERE id = ANY(${userIds})`;
}

setup("cria as fixtures de auth compartilhadas", async ({ page, browser }) => {
  setup.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );
  setup.setTimeout(120_000);

  await purgeFixtureData();

  await page.goto("/entrar");
  await page.getByRole("tab", { name: "criar conta" }).click();
  await page.getByLabel("nome").fill("Leitora E2E");
  await page.getByLabel("email").fill(READER_EMAIL);
  await page.getByLabel("senha").fill(FIXTURE_PASSWORD);
  await page.getByRole("button", { name: "criar conta" }).click();
  await page.waitForURL("/");
  await page.context().storageState({ path: READER_STATE });

  // Separate context so the reader session above stays untouched
  const adminContext = await browser.newContext();
  const adminPage = await adminContext.newPage();
  await adminPage.goto("/entrar");
  await adminPage.getByRole("tab", { name: "criar conta" }).click();
  await adminPage.getByLabel("nome").fill("Admin E2E");
  await adminPage.getByLabel("email").fill(ADMIN_EMAIL);
  await adminPage.getByLabel("senha").fill(FIXTURE_PASSWORD);
  await adminPage.getByRole("button", { name: "criar conta" }).click();
  await adminPage.waitForURL("/");

  const sql = requireDb();
  await sql`UPDATE "user" SET role = 'admin' WHERE email = ${ADMIN_EMAIL}`;

  // Re-login so the stored session reflects the promoted role
  await adminPage.getByRole("button", { name: "sair" }).click();
  await adminPage.goto("/entrar");
  await adminPage.getByLabel("email").fill(ADMIN_EMAIL);
  await adminPage.getByLabel("senha").fill(FIXTURE_PASSWORD);
  await adminPage.getByRole("button", { name: "entrar", exact: true }).click();
  await adminPage.waitForURL("/");
  await adminContext.storageState({ path: ADMIN_STATE });
  await adminContext.close();
});
