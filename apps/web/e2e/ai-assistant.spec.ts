import { neon } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("assistente de IA do editor", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  const email = `e2e-ai-assistant-${process.pid}@example.com`;

  test.afterAll(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return;
    const sql = neon(databaseUrl);
    await sql`DELETE FROM draft WHERE author_id IN (SELECT id FROM "user" WHERE email = ${email})`;
    await sql`DELETE FROM "user" WHERE email = ${email}`;
  });

  test("admin vê o assistente e o botão de ditar no editor", async ({
    page,
  }) => {
    // The rate-limit wait below eats far more than the default 30s budget
    test.setTimeout(90_000);

    const databaseUrl = process.env.DATABASE_URL;
    expect(databaseUrl, "DATABASE_URL precisa estar no ambiente").toBeTruthy();

    // better-auth caps /sign-up/email at 3 per 10s per IP, and every accepted
    // signup EXTENDS the window (lastRequest is bumped on each hit) — the other
    // specs chain signups until ~t≈35s, so this seventh one must come more than
    // 10s after the last of them or it 429s no matter how many windows passed
    await page.waitForTimeout(45_000);

    await page.goto("/entrar");
    await page.getByRole("tab", { name: "criar conta" }).click();
    await page.getByLabel("nome").fill("Admin E2E");
    await page.getByLabel("email").fill(email);
    await page.getByLabel("senha").fill("senha-de-teste-123");
    await page.getByRole("button", { name: "criar conta" }).click();
    await page.waitForURL("/");

    const sql = neon(databaseUrl as string);
    await sql`UPDATE "user" SET role = 'admin' WHERE email = ${email}`;

    // Re-login so the session reflects the promoted role
    await page.getByRole("button", { name: "sair" }).click();
    await page.goto("/entrar");
    await page.getByLabel("email").fill(email);
    await page.getByLabel("senha").fill("senha-de-teste-123");
    await page.getByRole("button", { name: "entrar", exact: true }).click();
    await page.waitForURL("/");

    await page.goto("/admin/editor");
    await page.getByRole("button", { name: "novo draft →" }).click();
    await page.waitForURL(/\/admin\/editor\/[0-9a-f-]+$/);

    await expect(page.getByText("assistente", { exact: true })).toBeVisible();
    await expect(
      page.getByRole("button", { name: "ditar", exact: true }),
    ).toBeVisible();

    // Opening the assistant exposes its actions — no Groq call is made here
    await page.getByText("assistente", { exact: true }).click();
    await expect(
      page.getByRole("button", { name: "sugerir pautas" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "gerar outline" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "melhorar seleção" }),
    ).toBeVisible();
  });
});
