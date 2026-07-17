import { describe, expect, it } from "vitest";
import {
  buildImproveTextPrompt,
  buildOutlinePrompt,
  buildPromotionPrompt,
  buildSuggestTopicsPrompt,
  splitPromotionResult,
} from "./ai-prompts";

describe("buildSuggestTopicsPrompt", () => {
  it("lists every published title with its tags and asks for 5 pautas", () => {
    const prompt = buildSuggestTopicsPrompt([
      { title: "Post A", tags: ["typescript", "react"] },
      { title: "Estudo B", tags: [] },
    ]);
    expect(prompt.user).toContain("- Post A (tags: typescript, react)");
    expect(prompt.user).toContain("- Estudo B");
    expect(prompt.user).toContain("5 pautas");
  });

  it("omits the tags suffix when the item has none", () => {
    const prompt = buildSuggestTopicsPrompt([{ title: "Estudo B", tags: [] }]);
    expect(prompt.user).not.toContain("tags:");
  });
});

describe("buildOutlinePrompt", () => {
  it("embeds the draft body and asks for a markdown outline", () => {
    const prompt = buildOutlinePrompt("## Rascunho\n\ntexto do post");
    expect(prompt.user).toContain("outline em markdown");
    expect(prompt.user).toContain("## Rascunho\n\ntexto do post");
  });
});

describe("buildImproveTextPrompt", () => {
  it("sends the raw text as the user message", () => {
    const prompt = buildImproveTextPrompt("trecho a melhorar");
    expect(prompt.user).toBe("trecho a melhorar");
  });

  it("locks the author voice in the system prompt", () => {
    const { system } = buildImproveTextPrompt("qualquer trecho");
    expect(system).toContain("primeira pessoa");
    expect(system).toContain("travessão");
    expect(system).toContain("dois-pontos");
  });
});

describe("buildPromotionPrompt", () => {
  const draft = {
    title: "Meu post",
    summary: "Resumo do post.",
    body: "## Seção\n\ntexto do post",
  };

  it("asks for a numbered X thread and a LinkedIn post with the draft data", () => {
    const prompt = buildPromotionPrompt(draft);
    expect(prompt.user).toContain("3 a 4 tweets numerados");
    expect(prompt.user).toContain("LinkedIn");
    expect(prompt.user).toContain("Título: Meu post");
    expect(prompt.user).toContain("Resumo: Resumo do post.");
    expect(prompt.user).toContain("## Seção\n\ntexto do post");
  });

  it("locks the author voice and bans travessão, mid-sentence colons and hashtag spam", () => {
    const { system } = buildPromotionPrompt(draft);
    expect(system).toContain("primeira pessoa");
    expect(system).toContain("travessão");
    expect(system).toContain("dois-pontos");
    expect(system).toContain("hashtags");
  });

  it("pins the THREAD/LINKEDIN output format the splitter relies on", () => {
    const { system } = buildPromotionPrompt(draft);
    expect(system).toContain("THREAD:");
    expect(system).toContain("LINKEDIN:");
  });
});

describe("splitPromotionResult", () => {
  it("splits the response into thread and linkedin blocks", () => {
    const blocks = splitPromotionResult(
      "THREAD:\n1/ primeiro\n2/ segundo\n\nLINKEDIN:\npost completo",
    );
    expect(blocks).toEqual([
      { label: "thread pro x", content: "1/ primeiro\n2/ segundo" },
      { label: "post pro linkedin", content: "post completo" },
    ]);
  });

  it("falls back to a single block when the format is not honored", () => {
    const blocks = splitPromotionResult("texto solto sem marcadores");
    expect(blocks).toEqual([
      { label: "divulgação", content: "texto solto sem marcadores" },
    ]);
  });
});
