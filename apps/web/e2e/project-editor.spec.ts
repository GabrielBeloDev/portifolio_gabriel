import { expect, test } from "@playwright/test";
import { ADMIN_STATE, requireDb } from "./fixtures";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1.
// Never triggers a real commit; only checks the project editor fields and the
// publish affordance tracking validity.
test.describe("publicar projeto", () => {
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

  test("o editor de projeto mostra stack, urls e categoria, sem corpo", async ({
    page,
  }) => {
    await page.goto("/admin/editor");
    await page.getByRole("button", { name: "novo projeto →" }).click();
    await page.waitForURL(/\/admin\/editor\/[0-9a-f-]+$/);
    draftId = new URL(page.url()).pathname.split("/").pop();

    // A project has stack, repo, live and category, and no MDX body or tags
    await expect(
      page.getByRole("button", { name: "projeto", exact: true }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByLabel("stack", { exact: true })).toBeVisible();
    await expect(page.getByLabel("repo", { exact: true })).toBeVisible();
    await expect(page.getByLabel("categoria", { exact: true })).toBeVisible();
    await expect(page.getByLabel("corpo em MDX")).toHaveCount(0);
    await expect(page.getByLabel("tags")).toHaveCount(0);

    await page.getByLabel("título").fill("Cosmo e2e");
    await page.getByLabel("slug").fill("cosmo-e2e");
    await page.getByLabel("resumo").fill("Plataforma pra aprender programação.");
    await page.getByLabel("stack", { exact: true }).fill("React, Node");

    await expect(page.getByRole("status")).toHaveText("salvo", {
      timeout: 10_000,
    });
    await expect(page.getByText("✓ frontmatter válido")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "publicar", exact: true }),
    ).toBeVisible();

    // A malformed repo url would fail velite's .url(), so publish is blocked
    await page.getByLabel("repo", { exact: true }).fill("nao-e-url");
    await expect(page.getByText("✓ frontmatter válido")).toHaveCount(0);
    await expect(page.getByText("repo não é uma URL válida")).toBeVisible();
  });
});
