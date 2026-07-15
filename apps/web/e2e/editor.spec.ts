import { neon } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("editor de drafts", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  const email = `e2e-editor-${process.pid}@example.com`;

  test.afterAll(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return;
    const sql = neon(databaseUrl);
    await sql`DELETE FROM draft WHERE author_id IN (SELECT id FROM "user" WHERE email = ${email})`;
    await sql`DELETE FROM "user" WHERE email = ${email}`;
  });

  test("admin cria draft, autosave persiste e preview renderiza código real", async ({
    page,
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

    await page.getByLabel("título").fill("Post do editor e2e");
    await page.getByLabel("slug").fill("post-do-editor-e2e");
    await page.getByLabel("resumo").fill("Resumo do teste de editor.");
    await page
      .getByLabel("corpo em MDX")
      .fill("## Seção\n\n```ts\nconst editor = true;\n```");

    await expect(page.getByRole("status")).toHaveText("salvo", {
      timeout: 10_000,
    });
    await expect(page.getByText("✓ frontmatter válido", { exact: false }))
      .toBeVisible();

    const highlighted = page.locator(
      "[data-rehype-pretty-code-figure] code span[style]",
    );
    await expect(highlighted.first()).toBeVisible({ timeout: 10_000 });

    await page.reload();
    await expect(page.getByLabel("título")).toHaveValue("Post do editor e2e");
    await expect(page.getByLabel("corpo em MDX")).toHaveValue(
      /const editor = true/,
    );
  });
});
