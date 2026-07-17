import { expect, test } from "@playwright/test";
import { ADMIN_STATE, ANONYMOUS_STATE, requireDb } from "./fixtures";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("link de revisão de rascunho", () => {
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

  test("admin gera link, revisor deslogado vê o draft e revogar derruba o acesso", async ({
    page,
    browser,
  }) => {
    await page.goto("/admin/editor");
    await page.getByRole("button", { name: "novo draft →" }).click();
    await page.waitForURL(/\/admin\/editor\/[0-9a-f-]+$/);
    draftId = new URL(page.url()).pathname.split("/").pop();

    await page.getByLabel("título").fill("Post compartilhado e2e");
    await page
      .getByLabel("corpo em MDX")
      .fill("## Seção em revisão\n\nconteúdo secreto para revisão");
    await expect(page.getByRole("status")).toHaveText("salvo", {
      timeout: 10_000,
    });

    await page.getByRole("button", { name: "gerar link de revisão" }).click();
    const shareUrlInput = page.getByLabel("URL do link de revisão");
    await expect(shareUrlInput).toBeVisible();
    const shareUrl = await shareUrlInput.inputValue();
    expect(shareUrl).toMatch(/\/rascunho\/[0-9a-f-]+$/);

    // Explicit empty storage: the reviewer must be logged out by construction,
    // and a plain newContext() would inherit the admin storageState above
    const reviewerContext = await browser.newContext({
      storageState: ANONYMOUS_STATE,
    });
    const reviewerPage = await reviewerContext.newPage();
    await reviewerPage.goto(shareUrl);
    await expect(
      reviewerPage.getByText(
        "rascunho não publicado — compartilhado para revisão",
      ),
    ).toBeVisible();
    await expect(
      reviewerPage.getByRole("heading", { name: "Post compartilhado e2e" }),
    ).toBeVisible();
    await expect(
      reviewerPage.getByText("conteúdo secreto para revisão"),
    ).toBeVisible();

    await page.getByRole("button", { name: "revogar" }).click();
    await expect(
      page.getByRole("button", { name: "gerar link de revisão" }),
    ).toBeVisible();

    const revokedResponse = await reviewerPage.goto(shareUrl);
    expect(revokedResponse?.status()).toBe(404);

    await reviewerContext.close();
  });
});
