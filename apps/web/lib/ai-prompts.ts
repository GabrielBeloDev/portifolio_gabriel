export type ChatPrompt = {
  system: string;
  user: string;
};

export type PublishedContentItem = {
  title: string;
  tags: string[];
};

const editorialVoice =
  "Você é o assistente editorial de um blog pessoal de engenharia de software escrito em português brasileiro.";

export function buildSuggestTopicsPrompt(
  published: PublishedContentItem[],
): ChatPrompt {
  const catalog = published
    .map((item) =>
      item.tags.length > 0
        ? `- ${item.title} (tags: ${item.tags.join(", ")})`
        : `- ${item.title}`,
    )
    .join("\n");
  return {
    system: editorialVoice,
    user: `Estes são os conteúdos já publicados no blog:\n\n${catalog}\n\nSugira 5 pautas curtas em português para os próximos posts, uma por linha, sem repetir os temas já publicados.`,
  };
}

export function buildOutlinePrompt(body: string): ChatPrompt {
  return {
    system: editorialVoice,
    user: `Gere um outline em markdown (headings e bullets) para o rascunho de post abaixo, em português. Responda apenas com o outline.\n\n${body}`,
  };
}

export function buildImproveTextPrompt(text: string): ChatPrompt {
  return {
    system:
      "Você reescreve trechos de posts de um blog pessoal mantendo a voz do autor: português natural, primeira pessoa. Não use travessão e não use dois-pontos no meio de frase. Responda apenas com o texto reescrito, sem comentários.",
    user: text,
  };
}

export const TLDR_BULLET_COUNT = 3;

// Groq context is generous but the summary only needs the opening of the post;
// truncating keeps the call cheap and deterministic for very long posts
const TLDR_SOURCE_MAX_CHARS = 8000;

export function buildTldrPrompt(body: string): ChatPrompt {
  return {
    system:
      "Você resume posts de um blog pessoal de engenharia de software mantendo a voz do autor: português natural, primeira pessoa. Não use travessão e não use dois-pontos no meio de frase. Responda apenas com 3 bullets curtos, um por linha, cada linha começando com '- ', sem nada antes ou depois.",
    user: `Resuma o post abaixo em 3 bullets que digam ao leitor o que ele vai encontrar.\n\n${body.slice(0, TLDR_SOURCE_MAX_CHARS)}`,
  };
}

export function parseTldrBullets(text: string): string[] {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
    .filter((line) => line.length > 0)
    .slice(0, TLDR_BULLET_COUNT);
}

export type PromotionDraft = {
  title: string;
  summary: string;
  body: string;
};

export type PromotionBlock = {
  label: string;
  content: string;
};

const THREAD_MARKER = "THREAD:";
const LINKEDIN_MARKER = "LINKEDIN:";

export function buildPromotionPrompt(draft: PromotionDraft): ChatPrompt {
  return {
    system: `Você divulga posts de um blog pessoal de engenharia de software mantendo a voz do autor: português natural, primeira pessoa. Não use travessão, não use dois-pontos no meio de frase e não encha o texto de hashtags. Responda em texto puro, sem markdown, exatamente neste formato, sem nada antes ou depois:\n\n${THREAD_MARKER}\n1/ primeiro tweet\n2/ segundo tweet\n\n${LINKEDIN_MARKER}\ntexto do post`,
    user: `Escreva a divulgação do post abaixo: uma thread curta para o X com 3 a 4 tweets numerados (1/, 2/, ...) e um post para o LinkedIn.\n\nTítulo: ${draft.title}\n\nResumo: ${draft.summary}\n\nConteúdo:\n\n${draft.body}`,
  };
}

export function splitPromotionResult(text: string): PromotionBlock[] {
  const linkedinIndex = text.indexOf(LINKEDIN_MARKER);
  // Model ignored the format contract; better one raw block than losing content
  if (linkedinIndex === -1) {
    return [{ label: "divulgação", content: text.trim() }];
  }
  const thread = text.slice(0, linkedinIndex).replace(THREAD_MARKER, "").trim();
  const linkedin = text.slice(linkedinIndex + LINKEDIN_MARKER.length).trim();
  return [
    { label: "thread pro x", content: thread },
    { label: "post pro linkedin", content: linkedin },
  ];
}
