import { expect, test } from "@playwright/test";

// Needs the real database and auth stack — run locally with E2E_WITH_DB=1
test.describe("comentários", () => {
  test.skip(
    process.env.E2E_WITH_DB !== "1",
    "requer banco real (E2E_WITH_DB=1)",
  );

  const email = `e2e-comments-${process.pid}@example.com`;
  const postUrl = "/blog/o-pipeline-deste-blog";

  test("fluxo completo: cadastrar, comentar, responder e apagar preservando a thread", async ({
    page,
  }) => {
    await page.goto(postUrl);
    await expect(page.getByText("entre", { exact: false })).toBeVisible();

    await page.goto("/entrar");
    await page.getByRole("tab", { name: "criar conta" }).click();
    await page.getByLabel("nome").fill("Conta E2E");
    await page.getByLabel("email").fill(email);
    await page.getByLabel("senha").fill("senha-de-teste-123");
    await page.getByRole("button", { name: "criar conta" }).click();
    await page.waitForURL("/");

    await page.goto(postUrl);
    await page.getByPlaceholder("seu comentário…").fill("comentário raiz e2e");
    await page.getByRole("button", { name: "comentar" }).click();
    await expect(page.getByText("comentário raiz e2e")).toBeVisible();

    const postLike = page.getByRole("button", { name: "curtir post" });
    await postLike.click();
    await expect(postLike).toHaveText("1");
    await expect(postLike).toHaveAttribute("aria-pressed", "true");

    const commentLike = page
      .getByRole("button", { name: "curtir comentário" })
      .first();
    await commentLike.click();
    await expect(commentLike).toHaveText("1");

    // Reload proves persistence beyond the optimistic state
    await page.reload();
    await expect(
      page.getByRole("button", { name: "curtir post" }),
    ).toHaveAttribute("aria-pressed", "true");

    // Same-author cooldown between comments is 15s by design
    await page.waitForTimeout(15_500);

    await page.getByRole("button", { name: "responder" }).first().click();
    await page.getByPlaceholder("sua resposta…").fill("resposta aninhada e2e");
    await page.getByRole("button", { name: "responder" }).last().click();
    await expect(page.getByText("resposta aninhada e2e")).toBeVisible();

    await page.getByRole("button", { name: "apagar" }).first().click();
    await expect(page.getByText("[removido]")).toBeVisible();
    await expect(page.getByText("resposta aninhada e2e")).toBeVisible();
  });
});
