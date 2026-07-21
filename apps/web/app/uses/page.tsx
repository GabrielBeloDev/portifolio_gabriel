import type { Metadata } from "next";
import { codeToHtml } from "shiki";
import { USES_DOTFILES } from "@/lib/ide-route";
import { amberInk } from "@/lib/shiki/amber-ink";
import { amberPaper } from "@/lib/shiki/amber-paper";

export const metadata: Metadata = {
  title: "uses",
  description: "O setup por trás deste site, lido como uma pasta de dotfiles.",
};

type DotfileAnchor = (typeof USES_DOTFILES)[number]["anchor"];

interface DotfileSource {
  readonly lang: "jsonc" | "ini" | "txt";
  readonly code: string;
}

const DOTFILE_SOURCES: Record<DotfileAnchor, DotfileSource> = {
  "hardware-json": {
    lang: "jsonc",
    code: `{
  "notebook": "MacBook Pro (M5 Pro, 24 GB)",
  "monitor": "AOC Hero 144 Hz",
  "mouse": "Logitech G Pro X Superlight",
  "pc_gamer": "só pra jogar, principalmente Valorant"
}`,
  },
  "stack-json": {
    lang: "jsonc",
    code: `// gerado do que este repositório realmente usa
{
  "linguagem": "TypeScript 5.9 (strict)",
  "runtime": "Node 24",
  "framework": "Next.js 16 + React 19",
  "estilos": "Tailwind CSS 4",
  "conteudo": "MDX + Velite",
  "banco": "PostgreSQL + Drizzle ORM",
  "auth": "better-auth",
  "validacao": "Zod 4"
}`,
  },
  "tools-txt": {
    lang: "txt",
    code: `# gerado do que este repositório realmente usa

pnpm 11       workspaces do monorepo
turbo 2       build, lint e testes com cache
velite        conteúdo tipado (quebra o build se eu errar)
drizzle-kit   migrations versionadas em apps/web/drizzle
vitest 4      testes unitários
playwright    e2e em chromium
eslint 10     lint
prettier 3    formatação (com o plugin do tailwind)
shiki 4       syntax highlight (amber-ink / amber-paper)`,
  },
  "site-config": {
    lang: "ini",
    code: `; gerado do que este repositório realmente usa

[deploy]
plataforma = Vercel

[banco]
provedor = Neon (Postgres serverless)
orm = Drizzle

[ia]
provedor = Groq
chat = llama-3.3-70b-versatile
transcricao = whisper-large-v3`,
  },
};

async function highlightDotfile(source: DotfileSource): Promise<string> {
  return codeToHtml(source.code, {
    lang: source.lang,
    themes: { light: amberPaper, dark: amberInk },
  });
}

export default async function UsesPage() {
  const cards = await Promise.all(
    USES_DOTFILES.map(async (file) => ({
      ...file,
      html: await highlightDotfile(DOTFILE_SOURCES[file.anchor]),
    })),
  );

  return (
    <div className="mx-auto max-w-[720px] px-6 py-10 sm:py-14">
      <p className="mb-2 font-mono text-sm text-muted-2"># uses</p>
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-[46px]">
        .dotfiles/
      </h1>
      <p className="mt-3 max-w-prose text-lg leading-relaxed text-muted">
        Meu setup lido como uma pasta de dotfiles. Cada arquivo abaixo é
        derivado do que este repositório{" "}
        <span className="text-accent">realmente usa</span> — nada de lista
        decorativa.
      </p>

      <div className="mt-10 space-y-8">
        {cards.map((card) => (
          <section
            key={card.anchor}
            id={card.anchor}
            aria-label={card.filename}
          >
            <figure data-rehype-pretty-code-figure="">
              <figcaption data-rehype-pretty-code-title="">
                {card.filename}
              </figcaption>
              {/* Build-time snippets defined above — not user input */}
              <div dangerouslySetInnerHTML={{ __html: card.html }} />
            </figure>
          </section>
        ))}
      </div>
    </div>
  );
}
