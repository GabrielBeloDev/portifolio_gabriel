import { neon } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("dashboard do admin", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  const email = `e2e-dashboard-${process.pid}@example.com`;

  test.afterAll(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return;
    const sql = neon(databaseUrl);
    await sql`DELETE FROM "user" WHERE email = ${email}`;
  });

  test("deslogado, /admin/dashboard redireciona para /entrar", async ({
    page,
  }) => {
    // The proxy middleware bounces sessionless requests before the page runs,
    // so an anonymous visitor never reaches the notFound gate
    await page.goto("/admin/dashboard");
    await page.waitForURL("/entrar");
  });

  test("admin vê heading, a própria linha na tabela e os cards de totais", async ({
    page,
  }) => {
    // The rate-limit wait below eats far more than the default 30s budget
    test.setTimeout(120_000);

    const databaseUrl = process.env.DATABASE_URL;
    expect(databaseUrl, "DATABASE_URL precisa estar no ambiente").toBeTruthy();

    // better-auth caps /sign-up/email at 3 per 10s per IP and every accepted
    // signup extends the window — the other specs chain signups until ~t≈46s
    // (ai-assistant waits 45s), so this one takes the next free slot
    // (see docs/dev-notes.md)
    await page.waitForTimeout(60_000);

    await page.goto("/entrar");
    await page.getByRole("tab", { name: "criar conta" }).click();
    await page.getByLabel("nome").fill("Admin E2E Dashboard");
    await page.getByLabel("email").fill(email);
    await page.getByLabel("senha").fill("senha-de-teste-123");
    await page.getByRole("button", { name: "criar conta" }).click();
    await page.waitForURL("/");

    // Logged in but not admin yet: the notFound gate must answer 404
    const nonAdminResponse = await page.goto("/admin/dashboard");
    expect(nonAdminResponse?.status()).toBe(404);

    const sql = neon(databaseUrl as string);
    await sql`UPDATE "user" SET role = 'admin' WHERE email = ${email}`;

    // Re-login so the session reflects the promoted role
    await page.goto("/");
    await page.getByRole("button", { name: "sair" }).click();
    await page.goto("/entrar");
    await page.getByLabel("email").fill(email);
    await page.getByLabel("senha").fill("senha-de-teste-123");
    await page.getByRole("button", { name: "entrar", exact: true }).click();
    await page.waitForURL("/");

    await page.goto("/admin/dashboard");
    await expect(
      page.getByRole("heading", { name: "dashboard" }),
    ).toBeVisible();

    await expect(page.getByText(email)).toBeVisible();

    await expect(page.getByText("comentários", { exact: true })).toBeVisible();
    await expect(page.getByText("likes", { exact: true })).toBeVisible();
    await expect(
      page.getByText("reportados pendentes", { exact: true }),
    ).toBeVisible();
  });
});
