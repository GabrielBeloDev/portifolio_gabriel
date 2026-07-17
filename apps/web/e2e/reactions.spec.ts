import { expect, test } from "@playwright/test";
import {
  ANONYMOUS_STATE,
  READER_EMAIL,
  READER_STATE,
  requireDb,
} from "./fixtures";

const postSlug = "transformei-meu-site-num-ide";

function reactionCount(text: string | null): number {
  return Number(/\((\d+)\)/.exec(text ?? "")?.[1]);
}

// Needs the real database and auth stack — run locally with E2E_WITH_DB=1
test.describe("reações em posts", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test.use({ storageState: READER_STATE });

  const postUrl = `/blog/${postSlug}`;

  // The test un-reacts at the end; this sweep only covers a run that died
  // mid-test, and never touches the shared reader fixture itself
  test.afterAll(async () => {
    const sql = requireDb();
    await sql`DELETE FROM "like" WHERE target_type = 'post' AND target_id = ${postSlug} AND reader_id IN (SELECT id FROM "user" WHERE email = ${READER_EMAIL})`;
  });

  test("logado reage útil e desreage; deslogado vê convite de login", async ({
    page,
    browser,
  }) => {
    // Signed out, reactions are login invites — links, not buttons
    const anonContext = await browser.newContext({
      storageState: ANONYMOUS_STATE,
    });
    const anonPage = await anonContext.newPage();
    await anonPage.goto(postUrl);
    await expect(
      anonPage.getByRole("link", { name: "reagir útil (requer login)" }),
    ).toBeVisible();
    await expect(anonPage.getByRole("button", { name: "reagir útil" })).toHaveCount(0);
    await anonContext.close();

    await page.goto(postUrl);
    const utilButton = page.getByRole("button", { name: "reagir útil" });
    await expect(utilButton).toBeVisible();

    // The post is shared state in the real database — assert the increment,
    // not an absolute count, so reactions from real users don't break the test
    const countBefore = reactionCount(await utilButton.textContent());
    expect(
      Number.isFinite(countBefore),
      "contador de reações deve ser um número",
    ).toBe(true);

    // The optimistic UI updates before the server action commits; reloading
    // too early would read the pre-insert count, so wait for the POST to settle
    const toggleSettled = page.waitForResponse(
      (response) => response.request().method() === "POST",
    );
    await utilButton.click();
    await expect(utilButton).toHaveText(`útil (${countBefore + 1})`);
    await expect(utilButton).toHaveAttribute("aria-pressed", "true");
    await toggleSettled;

    // Reload proves persistence beyond the optimistic state
    await page.reload();
    const utilAfterReload = page.getByRole("button", { name: "reagir útil" });
    await expect(utilAfterReload).toHaveText(`útil (${countBefore + 1})`);
    await expect(utilAfterReload).toHaveAttribute("aria-pressed", "true");

    await utilAfterReload.click();
    await expect(utilAfterReload).toHaveText(`útil (${countBefore})`);
    await expect(utilAfterReload).toHaveAttribute("aria-pressed", "false");
  });
});
