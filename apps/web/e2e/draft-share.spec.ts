import { neon } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("link de revisão de rascunho", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  const email = `e2e-draft-share-${process.pid}@example.com`;

  test.afterAll(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return;
    const sql = neon(databaseUrl);
    await sql`DELETE FROM draft WHERE author_id IN (SELECT id FROM "user" WHERE email = ${email})`;
    await sql`DELETE FROM "user" WHERE email = ${email}`;
  });

  test("admin gera link, revisor deslogado vê o draft e revogar derruba o acesso", async ({
    page,
    browser,
  }) => {
    const databaseUrl = process.env.DATABASE_URL;
    expect(databaseUrl, "DATABASE_URL precisa estar no ambiente").toBeTruthy();

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

    await page.getByLabel("título").fill("Post compartilhado e2e");
    await page
      .getByLabel("corpo em MDX")
      .fill("## Seção em revisão\n\nconteúdo secreto para revisão");
    await expect(page.getByRole("status")).toHaveText("salvo", {
      timeout: 10_000,
    });

    await page.getByRole("button", { name: "gerar link de revisão" }).click();
    const shareUrlInput = page.getByLabel("URL do link de revisão");
    await expect(shareUrlInput).toBeVisible();
    const shareUrl = await shareUrlInput.inputValue();
    expect(shareUrl).toMatch(/\/rascunho\/[0-9a-f-]+$/);

    // A fresh context carries no session — the reviewer is logged out by construction
    const reviewerContext = await browser.newContext();
    const reviewerPage = await reviewerContext.newPage();
    await reviewerPage.goto(shareUrl);
    await expect(
      reviewerPage.getByText(
        "rascunho não publicado — compartilhado para revisão",
      ),
    ).toBeVisible();
    await expect(
      reviewerPage.getByRole("heading", { name: "Post compartilhado e2e" }),
    ).toBeVisible();
    await expect(
      reviewerPage.getByText("conteúdo secreto para revisão"),
    ).toBeVisible();

    await page.getByRole("button", { name: "revogar" }).click();
    await expect(
      page.getByRole("button", { name: "gerar link de revisão" }),
    ).toBeVisible();

    const revokedResponse = await reviewerPage.goto(shareUrl);
    expect(revokedResponse?.status()).toBe(404);

    await reviewerContext.close();
  });
});
