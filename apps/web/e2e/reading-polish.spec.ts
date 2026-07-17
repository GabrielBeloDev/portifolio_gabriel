import { expect, test } from "@playwright/test";

const POST_WITH_FOOTNOTE = "/blog/transformei-meu-site-num-ide";

test("ref de nota abre o painel de notas e o backref volta ao texto", async ({
  page,
}) => {
  await page.goto(POST_WITH_FOOTNOTE);

  const notesPanel = page.locator("details[data-footnotes]");
  await expect(notesPanel).toBeAttached();
  await expect(notesPanel.locator("summary")).toContainText("notas (1)");
  await expect(notesPanel).not.toHaveAttribute("open", "");

  // Fragment navigation into a closed <details> must reveal it (ancestor
  // details revealing algorithm) and scroll the pane to the note
  const footnoteRef = page.locator("[data-footnote-ref]");
  await footnoteRef.click();
  await expect(notesPanel).toHaveAttribute("open", "");
  await expect(notesPanel.getByText(/O balde é por IP/)).toBeInViewport();

  await notesPanel.locator("[data-footnote-backref]").click();
  await expect(footnoteRef).toBeInViewport();
});

test("statusbar mostra o tempo restante no post e some no fim", async ({
  page,
}) => {
  await page.goto(POST_WITH_FOOTNOTE);

  const statusBarTimeLeft = page.getByText(/min restantes/);
  await expect(statusBarTimeLeft).toBeVisible();
  await expect(statusBarTimeLeft).toHaveText(/^~\d+ min restantes$/);

  // Smooth scroll can land short of the exact bottom, so keep pushing until
  // the end-of-reading note replaces the countdown
  const pane = page.locator("#conteudo");
  await expect
    .poll(async () => {
      await pane.evaluate((el) => el.scrollTo(0, el.scrollHeight));
      return page.getByText("fim da leitura").isVisible();
    })
    .toBe(true);
  await expect(page.getByText("fim da leitura")).toBeHidden({
    timeout: 6_000,
  });
});

test("statusbar não mostra tempo restante fora de post", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText(/min restantes/)).toHaveCount(0);
  await page.goto("/blog");
  await expect(page.getByText(/min restantes/)).toHaveCount(0);
});
