type DraftMdxFields = {
  title: string;
  slug: string;
  summary: string;
  tags: string;
  body: string;
};

export function draftToMdx(fields: DraftMdxFields): string {
  const tags = fields.tags
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const date = new Date().toISOString().slice(0, 10);

  return [
    "---",
    `title: ${JSON.stringify(fields.title)}`,
    `date: ${date}`,
    `summary: ${JSON.stringify(fields.summary)}`,
    `tags: [${tags.map((tag) => JSON.stringify(tag)).join(", ")}]`,
    "---",
    "",
    fields.body,
  ].join("\n");
}
