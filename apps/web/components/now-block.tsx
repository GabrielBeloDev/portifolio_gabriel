import { codeToHtml } from "shiki";
import { amberInk } from "@/lib/shiki/amber-ink";
import { amberPaper } from "@/lib/shiki/amber-paper";

const NOW_SNIPPET = `export const now = {
  construindo: "este site",
  aprendendo: ["Kubernetes", "Terraform"],
  escrevendo: "o pipeline deste blog",
} as const;`;

export async function NowBlock() {
  const html = await codeToHtml(NOW_SNIPPET, {
    lang: "typescript",
    themes: { light: amberPaper, dark: amberInk },
  });
  return (
    <figure data-rehype-pretty-code-figure="">
      <figcaption data-rehype-pretty-code-title="">now.ts</figcaption>
      {/* Build-time snippet defined above — not user input */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </figure>
  );
}
