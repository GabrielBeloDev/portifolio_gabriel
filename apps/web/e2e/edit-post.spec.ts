import { neon } from "@neondatabase/serverless";
import { expect, test } from "@playwright/test";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("editar post publicado", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  const email = `e2e-edit-post-${process.pid}@example.com`;

  test.afterAll(async () => {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) return;
    const sql = neon(databaseUrl);
    await sql`DELETE FROM draft WHERE author_id IN (SELECT id FROM "user" WHERE email = ${email})`;
    await sql`DELETE FROM "user" WHERE email = ${email}`;
  });

  // Single test on purpose: a second test in this file would occupy another
  // worker slot at startup and displace the other specs' signups into an
  // already-full better-auth rate-limit window (3 per 10s, docs/dev-notes.md)
  test("deslogado não vê editar; admin abre o editor com o conteúdo real do post", async ({
    page,
  }) => {
    // The rate-limit wait below consumes the default 30s budget
    test.setTimeout(90_000);

    const databaseUrl = process.env.DATABASE_URL;
    expect(databaseUrl, "DATABASE_URL precisa estar no ambiente").toBeTruthy();

    await page.goto("/blog/o-pipeline-deste-blog");
    await expect(
      page.getByRole("heading", {
        name: "O pipeline deste blog: velite, Shiki e Mermaid",
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "editar", exact: true }),
    ).toHaveCount(0);

    // better-auth rate-limits /sign-up/email to 3 requests per 10s per IP.
    // The db-backed specs burn that budget at run start and again at ~15s
    // (editor-tools + comment-report), so this signup waits for a third window
    await page.waitForTimeout(30_000);

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

    await page.goto("/blog/o-pipeline-deste-blog");
    await page.getByRole("button", { name: "editar", exact: true }).click();
    await page.waitForURL(/\/admin\/editor\/[0-9a-f-]+$/);

    await expect(page.getByLabel("título")).toHaveValue(
      "O pipeline deste blog: velite, Shiki e Mermaid",
    );
    await expect(page.getByLabel("slug")).toHaveValue("o-pipeline-deste-blog");
    await expect(page.getByLabel("corpo em MDX")).toHaveValue(
      /velite valida o frontmatter/,
    );
  });
});
