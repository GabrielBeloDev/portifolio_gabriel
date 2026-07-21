import { expect, test } from "@playwright/test";
import { ADMIN_STATE, requireDb } from "./fixtures";

// Needs the real database and an admin user — run locally with E2E_WITH_DB=1
test.describe("colar imagem no editor", () => {
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

  test("colar uma imagem sobe pro Blob (mockado) e insere ![](url) no corpo", async ({
    page,
  }) => {
    // The real Blob upload never runs in CI (no token there) — stub the route so
    // this exercises the client flow with a deterministic url
    await page.route("**/api/upload", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ url: "https://blob.example/x.png" }),
      }),
    );

    await page.goto("/admin/editor");
    await page.getByRole("button", { name: "novo draft →" }).click();
    await page.waitForURL(/\/admin\/editor\/[0-9a-f-]+$/);
    draftId = new URL(page.url()).pathname.split("/").pop();

    const body = page.getByLabel("corpo em MDX");
    await body.fill("linha um");

    // Synthesize a clipboard paste carrying a PNG into the body textarea
    await body.evaluate((element) => {
      const textarea = element as HTMLTextAreaElement;
      const file = new File([new Uint8Array([1, 2, 3])], "print.png", {
        type: "image/png",
      });
      const transfer = new DataTransfer();
      transfer.items.add(file);
      const event = new ClipboardEvent("paste", {
        bubbles: true,
        cancelable: true,
        clipboardData: transfer,
      });
      // Chromium may drop clipboardData from the constructor — force it on
      if (!event.clipboardData) {
        Object.defineProperty(event, "clipboardData", { value: transfer });
      }
      textarea.focus();
      textarea.setSelectionRange(textarea.value.length, textarea.value.length);
      textarea.dispatchEvent(event);
    });

    await expect(body).toHaveValue(
      /linha um[\s\S]*!\[\]\(https:\/\/blob\.example\/x\.png\)/,
    );
    await expect(body).not.toHaveValue(/enviando imagem/);
  });
});
