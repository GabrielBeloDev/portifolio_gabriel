import { neon } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("pacote de publicação do editor", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  const email = `e2e-editor-pack-${process.pid}@example.com`;

  test.afterAll(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return;
    const sql = neon(databaseUrl);
    await sql`DELETE FROM draft WHERE author_id IN (SELECT id FROM "user" WHERE email = ${email})`;
    await sql`DELETE FROM "user" WHERE email = ${email}`;
  });

  test("problems reage ao resumo, preview mobile restringe largura e divulgar aparece", async ({
    page,
  }) => {
    // The rate-limit wait below eats far more than the default 30s budget
    test.setTimeout(120_000);

    const databaseUrl = process.env.DATABASE_URL;
    expect(databaseUrl, "DATABASE_URL precisa estar no ambiente").toBeTruthy();

    // better-auth caps /sign-up/email at 3 per 10s per IP and every accepted
    // signup EXTENDS the window — ai-assistant.spec fires the seventh signup at
    // ~t≈45s, so this eighth one waits a bit longer to land inside its window
    // (2 of the 3 allowed requests) instead of colliding with a stale one
    await page.waitForTimeout(50_000);

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

    await page.getByLabel("título").fill("Post do editor pack e2e");
    await page.getByLabel("slug").fill("post-do-editor-pack-e2e");
    await page
      .getByLabel("corpo em MDX")
      .fill("## Seção\n\ntexto do pacote de editor");

    // A summary above the 300-char velite limit surfaces as an error and
    // suppresses the copy CTA until fixed
    await page.getByLabel("resumo").fill("a".repeat(301));
    await expect(page.getByText("resumo > 300 caracteres")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "copiar .mdx", exact: true }),
    ).not.toBeVisible();

    await page.getByLabel("resumo").fill("Resumo válido do editor pack.");
    await expect(
      page.getByText("✓ frontmatter válido", { exact: false }),
    ).toBeVisible();

    // Warnings coexist with the valid-frontmatter state and clear when fixed
    await expect(page.getByText("post sem tags")).toBeVisible();
    await page.getByLabel("tags").fill("e2e, editor");
    await expect(page.getByText("post sem tags")).not.toBeVisible();

    const previewFrame = page.getByTestId("preview-viewport");
    await page.getByRole("button", { name: "mobile", exact: true }).click();
    const mobileBox = await previewFrame.boundingBox();
    expect(mobileBox).not.toBeNull();
    expect(mobileBox!.width).toBeLessThanOrEqual(391);

    await page.getByRole("button", { name: "desktop", exact: true }).click();
    const desktopBox = await previewFrame.boundingBox();
    expect(desktopBox).not.toBeNull();
    expect(desktopBox!.width).toBeGreaterThan(391);

    // Presence only — the real Groq call is validated outside the e2e suite
    await page.getByText("assistente", { exact: true }).click();
    const promoteButton = page.getByRole("button", {
      name: "divulgar",
      exact: true,
    });
    await expect(promoteButton).toBeVisible();
    await expect(promoteButton).toBeEnabled();
  });
});
