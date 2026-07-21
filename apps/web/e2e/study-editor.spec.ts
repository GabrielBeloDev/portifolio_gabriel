import { expect, test } from "@playwright/test";
import { ADMIN_STATE, requireDb } from "./fixtures";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1.
// Like publish.spec, this never triggers a real commit; it only checks that the
// study editor swaps its fields and that publish tracks frontmatter validity.
test.describe("publicar estudo", () => {
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

  test("o editor de estudo troca os campos e libera publicar", async ({
    page,
  }) => {
    await page.goto("/admin/editor");
    await page.getByRole("button", { name: "novo estudo →" }).click();
    await page.waitForURL(/\/admin\/editor\/[0-9a-f-]+$/);
    draftId = new URL(page.url()).pathname.split("/").pop();

    // A study drops the tags input and gains the project link input
    await expect(
      page.getByRole("button", { name: "estudo", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel("tags")).toHaveCount(0);
    await expect(page.getByLabel("projeto vinculado")).toBeVisible();

    await page.getByLabel("título").fill("Estudo publicável e2e");
    await page.getByLabel("slug").fill("estudo-publicavel-e2e");
    await page.getByLabel("resumo").fill("Resumo válido para o estudo.");
    await page
      .getByLabel("corpo em MDX")
      .fill("## Seção\n\nconteúdo do estudo pronto");

    await expect(page.getByRole("status")).toHaveText("salvo", {
      timeout: 10_000,
    });
    await expect(page.getByText("✓ frontmatter válido")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "publicar", exact: true }),
    ).toBeVisible();

    // Linking to a project that does not exist would break the velite build,
    // so the editor blocks it before publish
    await page.getByLabel("projeto vinculado").fill("projeto-fantasma");
    await expect(page.getByText("✓ frontmatter válido")).toHaveCount(0);
    await expect(
      page.getByText("projeto vinculado inexistente projeto-fantasma"),
    ).toBeVisible();
  });
});
