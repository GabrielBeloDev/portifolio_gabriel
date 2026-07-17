import { expect, test } from "@playwright/test";
import { ADMIN_EMAIL, ADMIN_STATE, READER_STATE } from "./fixtures";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("dashboard do admin", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test("deslogado, /admin/dashboard redireciona para /entrar", async ({
    page,
  }) => {
    // The proxy middleware bounces sessionless requests before the page runs,
    // so an anonymous visitor never reaches the notFound gate
    await page.goto("/admin/dashboard");
    await page.waitForURL("/entrar");
  });

  test("admin vê heading, a própria linha na tabela e os cards de totais", async ({
    browser,
  }) => {
    // Logged in but not admin: the notFound gate must answer 404
    const readerContext = await browser.newContext({
      storageState: READER_STATE,
    });
    const readerPage = await readerContext.newPage();
    const nonAdminResponse = await readerPage.goto("/admin/dashboard");
    expect(nonAdminResponse?.status()).toBe(404);
    await readerContext.close();

    const adminContext = await browser.newContext({
      storageState: ADMIN_STATE,
    });
    const adminPage = await adminContext.newPage();
    await adminPage.goto("/admin/dashboard");
    await expect(
      adminPage.getByRole("heading", { name: "dashboard" }),
    ).toBeVisible();

    await expect(adminPage.getByText(ADMIN_EMAIL)).toBeVisible();

    await expect(adminPage.getByText("comentários", { exact: true })).toBeVisible();
    await expect(adminPage.getByText("likes", { exact: true })).toBeVisible();
    await expect(
      adminPage.getByText("reportados pendentes", { exact: true }),
    ).toBeVisible();
    await adminContext.close();
  });
});
