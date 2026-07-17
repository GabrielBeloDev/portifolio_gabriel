import { expect, test } from "@playwright/test";
import { ADMIN_STATE, requireDb } from "./fixtures";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("ferramentas de escrita do editor", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test.use({
    storageState: ADMIN_STATE,
    permissions: ["clipboard-read", "clipboard-write"],
  });

  let draftId: string | undefined;

  // The test deletes its own draft; this sweep only covers a run that died
  // mid-test, and never touches the fixture user or other specs' drafts
  test.afterAll(async () => {
    if (!draftId) return;
    const sql = requireDb();
    await sql`DELETE FROM draft WHERE id = ${draftId}`;
  });

  test("contador de palavras, Cmd+S, copiar .mdx e apagar draft com confirmação", async ({
    page,
  }) => {
    await page.goto("/admin/editor");
    await page.getByRole("button", { name: "novo draft →" }).click();
    await page.waitForURL(/\/admin\/editor\/[0-9a-f-]+$/);
    draftId = new URL(page.url()).pathname.split("/").pop();

    await page.getByLabel("título").fill("Post de ferramentas e2e");
    await page.getByLabel("slug").fill("post-de-ferramentas-e2e");
    await page.getByLabel("resumo").fill("Resumo do teste de ferramentas.");
    await page
      .getByLabel("corpo em MDX")
      .fill("## Seção\n\num parágrafo com algumas palavras para contar");

    await expect(page.getByText(/\d+ palavras/)).toBeVisible();

    // Cmd+S flushes the debounce instead of opening the browser save dialog
    await page.getByLabel("corpo em MDX").press("ControlOrMeta+s");
    await expect(page.getByRole("status")).toHaveText("salvo", {
      timeout: 10_000,
    });

    await expect(
      page.getByText("✓ frontmatter válido", { exact: false }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "copiar .mdx", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "copiado ✓", exact: true }),
    ).toBeVisible();
    const copiedMdx = await page.evaluate(() =>
      navigator.clipboard.readText(),
    );
    expect(copiedMdx).toContain('title: "Post de ferramentas e2e"');
    expect(copiedMdx).toContain("um parágrafo com algumas palavras para contar");

    await page
      .getByRole("button", { name: "apagar draft", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "apagar draft?" }),
    ).toBeVisible();
    await page
      .getByRole("button", { name: "sim, apagar", exact: true })
      .click();
    await page.waitForURL("/admin/editor");
    await expect(page.getByText("Post de ferramentas e2e")).not.toBeVisible();
  });
});
