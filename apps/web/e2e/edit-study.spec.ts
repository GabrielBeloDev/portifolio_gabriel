import { expect, test } from "@playwright/test";
import { ADMIN_STATE, ANONYMOUS_STATE, requireDb } from "./fixtures";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("editar estudo publicado", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test.use({ storageState: ADMIN_STATE });

  let draftId: string | undefined;

  test.afterAll(async () => {
    if (!draftId) return;
    const sql = requireDb();
    await sql`DELETE FROM draft WHERE id = ${draftId}`;
  });

  test("deslogado não vê editar; admin reabre o estudo com type, conteúdo e projeto vinculado", async ({
    page,
    browser,
  }) => {
    const anonContext = await browser.newContext({
      storageState: ANONYMOUS_STATE,
    });
    const anonPage = await anonContext.newPage();
    await anonPage.goto("/estudos/como-construi-este-site");
    await expect(
      anonPage.getByRole("heading", { name: "Como construí este site" }),
    ).toBeVisible();
    await expect(
      anonPage.getByRole("button", { name: "editar", exact: true }),
    ).toHaveCount(0);
    await anonContext.close();

    await page.goto("/estudos/como-construi-este-site");
    await page.getByRole("button", { name: "editar", exact: true }).click();
    await page.waitForURL(/\/admin\/editor\/[0-9a-f-]+$/);
    draftId = new URL(page.url()).pathname.split("/").pop();

    // Reopens as a study, with the linked project rehydrated and no tags input
    await expect(
      page.getByRole("button", { name: "estudo", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel("título")).toHaveValue("Como construí este site");
    await expect(page.getByLabel("slug")).toHaveValue("como-construi-este-site");
    await expect(page.getByLabel("projeto vinculado")).toHaveValue("este-site");
    await expect(page.getByLabel("tags")).toHaveCount(0);
  });
});
