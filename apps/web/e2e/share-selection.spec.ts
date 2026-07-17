import { expect, test, type Page } from "@playwright/test";

const POST_PATH = "/blog/o-pipeline-deste-blog";
const SELECTION_LENGTH = 60;

async function selectProseText(page: Page) {
  await page.evaluate((selectionLength) => {
    const prose = document.querySelector(".prose");
    if (!prose) throw new Error("prose container not found");

    const walker = document.createTreeWalker(prose, NodeFilter.SHOW_TEXT);
    let textNode = walker.nextNode();
    while (
      textNode !== null &&
      (textNode.textContent?.trim().length ?? 0) < selectionLength
    ) {
      textNode = walker.nextNode();
    }
    if (!textNode) throw new Error("no prose text node long enough to select");

    const range = document.createRange();
    range.setStart(textNode, 0);
    range.setEnd(textNode, selectionLength);
    const selection = window.getSelection();
    if (!selection) throw new Error("selection API unavailable");
    selection.removeAllRanges();
    selection.addRange(range);
  }, SELECTION_LENGTH);
}

test("selecionar um trecho do post abre o popover de compartilhar", async ({
  page,
}) => {
  await page.goto(POST_PATH);
  await selectProseText(page);

  const toolbar = page.getByRole("toolbar", { name: "compartilhar trecho" });
  await expect(toolbar).toBeVisible();
  await expect(
    toolbar.getByRole("button", { name: "copiar link" }),
  ).toBeVisible();
  await expect(
    toolbar.getByRole("link", { name: "postar no X" }),
  ).toBeVisible();
  await expect(toolbar.getByRole("link", { name: "LinkedIn" })).toBeVisible();
});

test("copiar link coloca no clipboard a URL com text fragment", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(POST_PATH);
  await selectProseText(page);

  const copyButton = page.getByRole("button", { name: "copiar link" });
  await copyButton.click();
  await expect(copyButton).toHaveText("copiado ✓");

  const clipboardText = await page.evaluate(() =>
    navigator.clipboard.readText(),
  );
  expect(clipboardText).toContain(`${POST_PATH}#:~:text=`);
});
