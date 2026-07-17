import { expect, test } from "@playwright/test";
import { requireDb } from "./fixtures";

const email = `e2e-auth-${process.pid}@example.com`;

// Needs the real database and auth stack — run locally with E2E_WITH_DB=1
test.describe("cadastro e login", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test.afterAll(async () => {
    const sql = requireDb();
    // Sessions and accounts cascade with the user row
    await sql`DELETE FROM "user" WHERE email = ${email}`;
  });

  test("criar conta entra, sair desloga e login reabre a sessão", async ({
    page,
  }) => {
    await page.goto("/entrar");
    await page.getByRole("tab", { name: "criar conta" }).click();
    await page.getByLabel("nome").fill("Conta E2E Auth");
    await page.getByLabel("email").fill(email);
    await page.getByLabel("senha").fill("senha-de-teste-123");
    await page.getByRole("button", { name: "criar conta" }).click();
    await page.waitForURL("/");
    await expect(page.getByRole("button", { name: "sair" })).toBeVisible();

    await page.getByRole("button", { name: "sair" }).click();
    await expect(page.getByRole("link", { name: "entrar" })).toBeVisible();

    await page.goto("/entrar");
    await page.getByLabel("email").fill(email);
    await page.getByLabel("senha").fill("senha-de-teste-123");
    await page.getByRole("button", { name: "entrar", exact: true }).click();
    await page.waitForURL("/");
    await expect(page.getByRole("button", { name: "sair" })).toBeVisible();
  });
});
