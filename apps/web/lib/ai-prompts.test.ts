import { describe, expect, it } from "vitest";
import {
  buildImproveTextPrompt,
  buildOutlinePrompt,
  buildSuggestTopicsPrompt,
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
