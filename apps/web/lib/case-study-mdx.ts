type CaseStudyMdxFields = {
  title: string;
  slug: string;
  summary: string;
  body: string;
  projectSlug?: string;
};

export function caseStudyToMdx(fields: CaseStudyMdxFields): string {
  const date = new Date().toISOString().slice(0, 10);
  const projectSlug = fields.projectSlug?.trim() ?? "";

  const frontmatter = [
    "---",
    `title: ${JSON.stringify(fields.title)}`,
    `date: ${date}`,
    `summary: ${JSON.stringify(fields.summary)}`,
  ];
  // Omit the pointer entirely when absent, so the velite schema keeps it optional
  if (projectSlug !== "") {
    frontmatter.push(`projectSlug: ${JSON.stringify(projectSlug)}`);
  }

  return [...frontmatter, "---", "", fields.body].join("\n");
}
