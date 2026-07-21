import type { ProjectCategory } from "./draft-type";

type ProjectYamlFields = {
  title: string;
  summary: string;
  stack: string[];
  category: ProjectCategory;
  order: number;
  repo?: string;
  live?: string;
};

// Every scalar goes through JSON.stringify (valid YAML double-quoted form) so a
// title with a colon or a summary with a "#" can never break the parse, and the
// stack is emitted as a flow sequence, which is also valid YAML.
export function projectToYaml(fields: ProjectYamlFields): string {
  const lines = [
    `title: ${JSON.stringify(fields.title)}`,
    `summary: ${JSON.stringify(fields.summary)}`,
    `stack: [${fields.stack.map((tech) => JSON.stringify(tech)).join(", ")}]`,
    `category: ${JSON.stringify(fields.category)}`,
  ];

  const repo = fields.repo?.trim() ?? "";
  const live = fields.live?.trim() ?? "";
  // Emit URLs only when present; an empty string would fail velite's .url()
  if (repo !== "") lines.push(`repo: ${JSON.stringify(repo)}`);
  if (live !== "") lines.push(`live: ${JSON.stringify(live)}`);

  lines.push(`order: ${fields.order}`);

  return `${lines.join("\n")}\n`;
}
