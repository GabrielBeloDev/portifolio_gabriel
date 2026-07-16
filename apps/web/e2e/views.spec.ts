import { neon } from "@neondatabase/serverless";
import { expect, test, type Request } from "@playwright/test";

const slug = "adrs-num-projeto-solo";
const postUrl = `/blog/${slug}`;
const apiPath = `/api/views/${slug}`;

function requireDb() {
  const databaseUrl = process.env.DATABASE_URL;
  // This hook only runs with E2E_WITH_DB=1, so a missing URL is always
  // misconfiguration — failing loud beats a silent no-op sweep
  if (!databaseUrl) {
    throw new Error("E2E_WITH_DB=1 requer DATABASE_URL para limpar post_view");
  }
  return neon(databaseUrl);
}

const isViewsApiRequest = (request: Request) =>
  new URL(request.url()).pathname === apiPath;

let rowExistedBefore = false;

// Needs the real database — run locally with E2E_WITH_DB=1
test.describe("contador de leituras", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test.beforeAll(async () => {
    const sql = requireDb();
    const rows = await sql`SELECT count FROM post_view WHERE slug = ${slug}`;
    rowExistedBefore = rows.length > 0;
  });

  test.afterAll(async () => {
    // Only remove what this run created — a pre-existing row holds real views
    if (rowExistedBefore) return;
    const sql = requireDb();
    await sql`DELETE FROM post_view WHERE slug = ${slug}`;
  });

  test("abrir o post incrementa e exibe o contador; reload não incrementa na mesma sessão", async ({
    page,
  }) => {
    const firstViewBeacon = page.waitForRequest(
      (request) => isViewsApiRequest(request) && request.method() === "POST",
    );
    await page.goto(postUrl);
    await firstViewBeacon;
    await expect(page.getByText(/\d+ leituras?/)).toBeVisible();

    const sql = requireDb();
    const [row] = await sql`SELECT count FROM post_view WHERE slug = ${slug}`;
    expect(Number(row?.count)).toBeGreaterThanOrEqual(1);

    // Parallel specs may also open posts, so the no-reincrement guarantee is
    // asserted on this page's network traffic instead of the shared count
    const reloadRequests: string[] = [];
    page.on("request", (request) => {
      if (isViewsApiRequest(request)) reloadRequests.push(request.method());
    });
    await page.reload();
    await expect(page.getByText(/\d+ leituras?/)).toBeVisible();
    expect(reloadRequests).toContain("GET");
    expect(reloadRequests).not.toContain("POST");
  });

  test("row do blog exibe a contagem de leituras", async ({ page }) => {
    const sql = requireDb();
    // The row renders whatever GET returns; seeding one view keeps the
    // assertion meaningful even when this test runs before the post is opened
    await sql`INSERT INTO post_view (slug, count) VALUES (${slug}, 1) ON CONFLICT (slug) DO NOTHING`;

    await page.goto("/blog");
    const row = page.getByRole("link", { name: /ADRs num projeto solo/ });
    await expect(row.getByText(/\d+ leituras?/)).toBeVisible();
  });
});
