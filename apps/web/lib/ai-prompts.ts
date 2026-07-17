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
