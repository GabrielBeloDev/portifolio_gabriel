import { neon } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("ferramentas de escrita do editor", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test.use({ permissions: ["clipboard-read", "clipboard-write"] });

  const email = `e2e-editor-tools-${process.pid}@example.com`;

  test.afterAll(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return;
    const sql = neon(databaseUrl);
    await sql`DELETE FROM draft WHERE author_id IN (SELECT id FROM "user" WHERE email = ${email})`;
    await sql`DELETE FROM "user" WHERE email = ${email}`;
  });

  test("contador de palavras, Cmd+S, copiar .mdx e apagar draft com confirmação", async ({
    page,
  }) => {
    // The rate-limit wait below consumes half of the default 30s budget
    test.setTimeout(60_000);

    const databaseUrl = process.env.DATABASE_URL;
    expect(databaseUrl, "DATABASE_URL precisa estar no ambiente").toBeTruthy();

    // better-auth rate-limits /sign-up/email to 3 requests per 10s per IP and
    // the parallel specs already consume that burst — wait out the window so
    // this fourth signup does not 429 a neighbour spec (nor get 429'd itself)
    await page.waitForTimeout(15_000);

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

    await page.getByLabel("título").fill("Post de ferramentas e2e");
    await page.getByLabel("slug").fill("post-de-ferramentas-e2e");
    await page.getByLabel("resumo").fill("Resumo do teste de ferramentas.");
    await page
      .getByLabel("corpo em MDX")
      .fill("## Seção\n\num parágrafo com algumas palavras para contar");

    await expect(page.getByText(/\d+ palavras/)).toBeVisible();

    // Cmd+S flushes the debounce instead of opening the browser save dialog
    await page.getByLabel("corpo em MDX").press("ControlOrMeta+s");
    await expect(page.getByRole("status")).toHaveText("salvo", {
      timeout: 10_000,
    });

    await expect(
      page.getByText("✓ frontmatter válido", { exact: false }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "copiar .mdx", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "copiado ✓", exact: true }),
    ).toBeVisible();
    const copiedMdx = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(copiedMdx).toContain('title: "Post de ferramentas e2e"');
    expect(copiedMdx).toContain("um parágrafo com algumas palavras para contar");

    await page
      .getByRole("button", { name: "apagar draft", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "apagar draft?" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "sim, apagar", exact: true })
      .click();
    await page.waitForURL("/admin/editor");
    await expect(page.getByText("Post de ferramentas e2e")).not.toBeVisible();
  });
});
