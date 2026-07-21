import { expect, test } from "@playwright/test";

async function openTerminal(page: import("@playwright/test").Page) {
  await page.goto("/");
  await page.keyboard.press("Control+Backquote");
  const terminal = page.getByRole("region", { name: "terminal" });
  await expect(terminal).toBeVisible();
  // xterm mounts via a client-only dynamic import; wait for the prompt to paint
  await expect(terminal).toContainText("$", { timeout: 10_000 });
  await terminal.click();
  return terminal;
}

async function type(page: import("@playwright/test").Page, command: string) {
  await page.keyboard.type(command);
  await page.keyboard.press("Enter");
}

test("terminal abre pelo atalho, navega o filesystem e reporta comando inválido", async ({
  page,
}) => {
  const terminal = await openTerminal(page);

  await type(page, "ls");
  await expect(terminal).toContainText("blog/");

  await type(page, "cd blog");
  await expect(terminal).toContainText("~/blog");

  await type(page, "ls");
  await expect(terminal).toContainText(/\.mdx/);

  await type(page, "help");
  await expect(terminal).toContainText("open");

  await type(page, "foobar");
  await expect(terminal).toContainText("command not found");
});

test("terminal fecha pelo atalho e pelo botão", async ({ page }) => {
  const terminal = await openTerminal(page);
  await page.keyboard.press("Control+Backquote");
  await expect(terminal).toBeHidden();

  await page.keyboard.press("Control+Backquote");
  await expect(terminal).toBeVisible();
  await terminal.getByRole("button", { name: "fechar terminal" }).click();
  await expect(terminal).toBeHidden();
});

test("open navega o site a partir do terminal", async ({ page }) => {
  const terminal = await openTerminal(page);
  await type(page, "open sobre.md");
  await expect(page).toHaveURL(/\/sobre$/);
});
