import { expect, test } from "@playwright/test";
import { ADMIN_STATE, ANONYMOUS_STATE, requireDb } from "./fixtures";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("editar post publicado", () => {
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

  test("deslogado não vê editar; admin abre o editor com o conteúdo real do post", async ({
    page,
    browser,
  }) => {
    const anonContext = await browser.newContext({
      storageState: ANONYMOUS_STATE,
    });
    const anonPage = await anonContext.newPage();
    await anonPage.goto("/blog/o-pipeline-deste-blog");
    await expect(
      anonPage.getByRole("heading", {
        name: "O pipeline deste blog: velite, Shiki e Mermaid",
      }),
    ).toBeVisible();
    await expect(
      anonPage.getByRole("button", { name: "editar", exact: true }),
    ).toHaveCount(0);
    await anonContext.close();

    await page.goto("/blog/o-pipeline-deste-blog");
    await page.getByRole("button", { name: "editar", exact: true }).click();
    await page.waitForURL(/\/admin\/editor\/[0-9a-f-]+$/);
    draftId = new URL(page.url()).pathname.split("/").pop();

    await expect(page.getByLabel("título")).toHaveValue(
      "O pipeline deste blog: velite, Shiki e Mermaid",
    );
    await expect(page.getByLabel("slug")).toHaveValue("o-pipeline-deste-blog");
    await expect(page.getByLabel("corpo em MDX")).toHaveValue(
      /velite valida o frontmatter/,
    );
  });
});
