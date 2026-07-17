import { neon } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";

const slug = "o-pipeline-deste-blog";
const postUrl = `/blog/${slug}`;
const apiPath = `/api/views/${slug}`;

function requireDb() {
  const databaseUrl = process.env.DATABASE_URL;
  // This hook only runs with E2E_WITH_DB=1, so a missing URL is always
  // misconfiguration — failing loud beats a silent no-op sweep
  if (!databaseUrl) {
    throw new Error(
      "E2E_WITH_DB=1 requer DATABASE_URL para ler post_view_daily",
    );
  }
  return neon(databaseUrl);
}

async function readTodayCount(): Promise<number> {
  const sql = requireDb();
  const [row] =
    await sql`SELECT count FROM post_view_daily WHERE slug = ${slug} AND day = CURRENT_DATE`;
  return Number(row?.count ?? 0);
}

let countBefore = 0;

// Needs the real database — run locally with E2E_WITH_DB=1.
// No afterAll cleanup on purpose: the test opens a real post, so today's row
// is legitimate anonymous aggregate data shared with real readers — deleting
// it would erase their views too. The assertion is relative for the same reason.
test.describe("views diárias", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test.beforeAll(async () => {
    countBefore = await readTodayCount();
  });

  test("abrir o post incrementa a linha do dia em post_view_daily", async ({
    page,
  }) => {
    // The daily upsert runs before the route responds, so a settled response
    // guarantees the row is committed
    const viewBeacon = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === apiPath &&
        response.request().method() === "POST" &&
        response.ok(),
    );
    await page.goto(postUrl);
    await viewBeacon;

    const countAfter = await readTodayCount();
    expect(countAfter).toBeGreaterThanOrEqual(countBefore + 1);
  });
});
