import { expect, test } from "@playwright/test";
import { ADMIN_STATE, requireDb } from "./fixtures";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("editor de drafts", () => {
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

  test("admin cria draft, autosave persiste e preview renderiza código real", async ({
    page,
  }) => {
    await page.goto("/admin/editor");
    await page.getByRole("button", { name: "novo draft →" }).click();
    await page.waitForURL(/\/admin\/editor\/[0-9a-f-]+$/);
    draftId = new URL(page.url()).pathname.split("/").pop();

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
