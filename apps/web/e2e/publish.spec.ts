import { expect, test } from "@playwright/test";
import { ADMIN_STATE, requireDb } from "./fixtures";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1.
// The real publish commits to the repo, so it is never triggered here; this
// spec only checks that the publish affordance tracks frontmatter validity.
test.describe("publicar draft", () => {
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

  test("o botão publicar aparece só com frontmatter válido", async ({
    page,
  }) => {
    await page.goto("/admin/editor");
    await page.getByRole("button", { name: "novo draft →" }).click();
    await page.waitForURL(/\/admin\/editor\/[0-9a-f-]+$/);
    draftId = new URL(page.url()).pathname.split("/").pop();

    await page.getByLabel("título").fill("Post publicável e2e");
    await page.getByLabel("slug").fill("post-publicavel-e2e");
    await page.getByLabel("resumo").fill("Resumo válido para publicação.");
    await page.getByLabel("corpo em MDX").fill("## Seção\n\nconteúdo pronto");

    await expect(page.getByRole("status")).toHaveText("salvo", {
      timeout: 10_000,
    });
    await expect(page.getByText("✓ frontmatter válido")).toBeVisible();

    const publishButton = page.getByRole("button", {
      name: "publicar",
      exact: true,
    });
    await expect(publishButton).toBeVisible();

    // Emptying the title breaks the frontmatter, so the whole publish box goes
    await page.getByLabel("título").fill("");
    await expect(page.getByText("✓ frontmatter válido")).toHaveCount(0);
    await expect(publishButton).toHaveCount(0);
    await expect(page.getByText("título vazio")).toBeVisible();
  });
});
