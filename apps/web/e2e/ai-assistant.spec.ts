import { expect, test } from "@playwright/test";
import { ADMIN_STATE, requireDb } from "./fixtures";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("assistente de IA do editor", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test.use({ storageState: ADMIN_STATE });

  let draftId: string | undefined;

  // Drafts belong to the shared admin fixture, so the purge targets only the
  // draft this spec created — never the fixture user or other specs' drafts
  test.afterAll(async () => {
    if (!draftId) return;
    const sql = requireDb();
    await sql`DELETE FROM draft WHERE id = ${draftId}`;
  });

  test("admin vê o assistente e o botão de ditar no editor", async ({
    page,
  }) => {
    await page.goto("/admin/editor");
    await page.getByRole("button", { name: "novo draft →" }).click();
    await page.waitForURL(/\/admin\/editor\/[0-9a-f-]+$/);
    draftId = new URL(page.url()).pathname.split("/").pop();

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
