import { expect, test } from "@playwright/test";

test("/commits renderiza o git log real ou o aviso de indisponibilidade", async ({
  page,
}) => {
  await page.goto("/commits");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "git log --oneline main",
  );

  // The build may hit the unauthenticated GitHub rate limit in CI, so real
  // rows and the mono fallback are both acceptable outcomes
  const commitLinks = page
    .getByRole("main")
    .locator('a[href*="/portifolio_gabriel/commit/"]');
  const unavailableNotice = page.getByText("// histórico indisponível agora");
  await expect(commitLinks.first().or(unavailableNotice)).toBeVisible();
});

test("statusbar linka o status do ci para /commits", async ({ page }) => {
  await page.goto("/");
  const ciStatusLink = page.getByRole("link", {
    name: "histórico de commits",
  });
  await expect(ciStatusLink).toBeVisible();
  await expect(ciStatusLink).toHaveAttribute("href", "/commits");
});

test("explorer abre .git/log e navega até /commits", async ({ page }) => {
  await page.goto("/");
  const explorer = page.getByRole("navigation", { name: "principal" });
  await explorer.getByRole("link", { name: ".git/log" }).click();
  await expect(page).toHaveURL(/\/commits$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "git log --oneline main",
  );
});
