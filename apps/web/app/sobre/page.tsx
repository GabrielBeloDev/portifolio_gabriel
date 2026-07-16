import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "sobre",
  description: "Quem escreve e constrói este site.",
};

const GUTTER_LINES = Array.from({ length: 28 }, (_, index) => index + 1);

const STACK = [
  "TypeScript",
  "Next.js",
  "Tailwind",
  "PostgreSQL",
  "Drizzle",
  "Turborepo",
  "pnpm",
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-9 mb-4 font-mono text-[15px] font-medium tracking-[0.12em] text-ok uppercase">
      ## {children}
    </h2>
  );
}

export default function AboutPage() {
  return (
    <div className="flex">
      <div
        aria-hidden
        className="hidden w-14 shrink-0 pt-14 pr-4 text-right font-mono text-xs leading-loose text-faint/60 select-none md:block"
      >
        {GUTTER_LINES.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>

      <div className="max-w-3xl min-w-0 flex-1 px-6 py-12 pb-20 md:px-10 md:py-14">
        <p className="mb-2 font-mono text-sm text-faint"># sobre.md</p>
        <h1 className="font-display text-4xl font-bold tracking-tight sm:text-[46px]">
          Oi, eu sou o Gabriel.
        </h1>
        <p className="mt-3 max-w-prose text-lg leading-relaxed text-muted">
          Dev. Construo coisas na web e escrevo sobre o processo, porque
          escrever é o jeito mais honesto que encontrei de{" "}
          <span className="text-accent">entender o que estou estudando</span>.
        </p>

        <SectionHeading>agora</SectionHeading>
        <p className="max-w-prose leading-relaxed text-muted">
          No momento estou aprofundando em infraestrutura moderna — Kubernetes,
          Terraform, observabilidade — com a meta de que cada aprendizado vire
          um estudo publicado aqui.
        </p>

        <SectionHeading>este site</SectionHeading>
        <p className="max-w-prose leading-relaxed text-muted">
          Este site também é um trabalho: monorepo, design system próprio e
          conteúdo tipado. O código é aberto e está no{" "}
          <a
            href="https://github.com/GabrielBeloDev/portifolio_gabriel"
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-link/35 text-link transition-colors hover:border-link"
          >
            GitHub
          </a>
          .
        </p>

        <SectionHeading>stack &amp; ferramentas</SectionHeading>
        <div className="flex flex-wrap gap-2.5">
          {STACK.map((tech) => (
            <span
              key={tech}
              className="rounded-lg border border-line bg-surface px-3 py-1.5 font-mono text-[13px] text-muted"
            >
              {tech}
            </span>
          ))}
        </div>

        <SectionHeading>me acha em</SectionHeading>
        <p className="font-mono text-[15px] leading-loose">
          <a
            href="https://github.com/GabrielBeloDev"
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-link/35 text-link transition-colors hover:border-link"
          >
            github.com/GabrielBeloDev
          </a>
        </p>
      </div>
    </div>
  );
}
