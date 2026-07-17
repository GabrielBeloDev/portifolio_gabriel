import { expect, test } from "@playwright/test";

const slug = "o-pipeline-deste-blog";

// Needs the real database — run locally with E2E_WITH_DB=1.
// No afterAll cleanup on purpose: the cached summary in post_tldr is
// legitimate data shared with real readers; deleting it would force another
// Groq call on the next visit.
test.describe("tl;dr do post", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  test("post renderiza e o bloco tl;dr aparece com 1 a 3 bullets ou não aparece", async ({
    page,
  }) => {
    const tldrSettled = page.waitForResponse(
      (response) => new URL(response.url()).pathname === `/api/tldr/${slug}`,
    );
    await page.goto(`/blog/${slug}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    // Groq may be missing where the suite runs, so both outcomes are valid:
    // 200 renders the block, 204 legitimately renders nothing
    const response = await tldrSettled;
    expect([200, 204]).toContain(response.status());

    const tldrBlock = page.locator("details[data-tldr]");
    if (response.status() !== 200) {
      await expect(tldrBlock).toHaveCount(0);
      return;
    }
    await expect(tldrBlock).toBeVisible();
    await expect(tldrBlock.locator("summary")).toContainText("tl;dr");
    const bulletCount = await tldrBlock.locator("li").count();
    expect(bulletCount).toBeGreaterThanOrEqual(1);
    expect(bulletCount).toBeLessThanOrEqual(3);
  });
});
