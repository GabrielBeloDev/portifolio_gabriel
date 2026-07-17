import { expect, test } from "@playwright/test";
import { ADMIN_STATE, requireDb } from "./fixtures";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("pacote de publicação do editor", () => {
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

  test("problems reage ao resumo, preview mobile restringe largura e divulgar aparece", async ({
    page,
  }) => {
    await page.goto("/admin/editor");
    await page.getByRole("button", { name: "novo draft →" }).click();
    await page.waitForURL(/\/admin\/editor\/[0-9a-f-]+$/);
    draftId = new URL(page.url()).pathname.split("/").pop();

    await page.getByLabel("título").fill("Post do editor pack e2e");
    await page.getByLabel("slug").fill("post-do-editor-pack-e2e");
    await page
      .getByLabel("corpo em MDX")
      .fill("## Seção\n\ntexto do pacote de editor");

    // A summary above the 300-char velite limit surfaces as an error and
    // suppresses the copy CTA until fixed
    await page.getByLabel("resumo").fill("a".repeat(301));
    await expect(page.getByText("resumo > 300 caracteres")).toBeVisible();
    await expect(
      page.getByRole("button", { name: "copiar .mdx", exact: true }),
    ).not.toBeVisible();

    await page.getByLabel("resumo").fill("Resumo válido do editor pack.");
    await expect(
      page.getByText("✓ frontmatter válido", { exact: false }),
    ).toBeVisible();

    // Warnings coexist with the valid-frontmatter state and clear when fixed
    await expect(page.getByText("post sem tags")).toBeVisible();
    await page.getByLabel("tags").fill("e2e, editor");
    await expect(page.getByText("post sem tags")).not.toBeVisible();

    const previewFrame = page.getByTestId("preview-viewport");
    await page.getByRole("button", { name: "mobile", exact: true }).click();
    const mobileBox = await previewFrame.boundingBox();
    expect(mobileBox).not.toBeNull();
    expect(mobileBox!.width).toBeLessThanOrEqual(391);

    await page.getByRole("button", { name: "desktop", exact: true }).click();
    const desktopBox = await previewFrame.boundingBox();
    expect(desktopBox).not.toBeNull();
    expect(desktopBox!.width).toBeGreaterThan(391);

    // Presence only — the real Groq call is validated outside the e2e suite
    await page.getByText("assistente", { exact: true }).click();
    const promoteButton = page.getByRole("button", {
      name: "divulgar",
      exact: true,
    });
    await expect(promoteButton).toBeVisible();
    await expect(promoteButton).toBeEnabled();
  });
});
