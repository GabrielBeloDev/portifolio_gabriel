import { fetchPublicRepoLanguages, type LanguageShare } from "./github-data";

const PRODUCTION_STACK = [
  "TypeScript",
  "Next.js",
  "Tailwind",
  "PostgreSQL",
  "Drizzle",
  "Turborepo",
  "pnpm",
] as const;

const LEARNING_NOW = ["Kubernetes", "Terraform", "observabilidade"] as const;

const MAX_LANGUAGES_SHOWN = 8;

const formatPercent = (percent: number): string =>
  percent < 1 ? "<1%" : `${Math.round(percent)}%`;

function CommentLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-3 font-mono text-xs tracking-[0.1em] text-muted-2">
      <span aria-hidden>{"// "}</span>
      {children}
    </p>
  );
}

function Chip({
  children,
  highlighted = false,
}: {
  children: React.ReactNode;
  highlighted?: boolean;
}) {
  const chipTone = highlighted
    ? "border-accent/40 bg-accent-soft text-accent"
    : "border-line bg-surface text-muted";
  return (
    <span
      className={`rounded-lg border px-3 py-1.5 font-mono text-[13px] ${chipTone}`}
    >
      {children}
    </span>
  );
}

function LanguageBars({ languages }: { languages: readonly LanguageShare[] }) {
  return (
    <ul className="space-y-2">
      {languages.slice(0, MAX_LANGUAGES_SHOWN).map((language) => (
        <li key={language.name} className="flex items-center gap-3">
          <span className="w-24 shrink-0 font-mono text-xs text-muted">
            {language.name}
          </span>
          <span className="h-1.5 flex-1 overflow-hidden rounded-full border border-line bg-surface">
            <span
              className="block h-full rounded-full bg-accent-fill"
              style={{ width: `${Math.max(language.percent, 1)}%` }}
            />
          </span>
          <span className="w-10 shrink-0 text-right font-mono text-xs text-muted-2">
            {formatPercent(language.percent)}
          </span>
        </li>
      ))}
    </ul>
  );
}

export async function SkillsPanel() {
  const languages = await fetchPublicRepoLanguages();

  return (
    <div>
      <div className="grid gap-7 sm:grid-cols-2">
        <div>
          <CommentLabel>usados neste site em produção</CommentLabel>
          <div className="flex flex-wrap gap-2.5">
            {PRODUCTION_STACK.map((tech) => (
              <Chip key={tech}>{tech}</Chip>
            ))}
          </div>
        </div>
        <div>
          <CommentLabel>aprendendo agora</CommentLabel>
          <div className="flex flex-wrap gap-2.5">
            {LEARNING_NOW.map((topic) => (
              <Chip key={topic} highlighted>
                {topic}
              </Chip>
            ))}
          </div>
        </div>
      </div>
      {languages && (
        <div className="mt-7">
          <CommentLabel>linguagens dos meus repositórios públicos</CommentLabel>
          <LanguageBars languages={languages} />
        </div>
      )}
    </div>
  );
}
