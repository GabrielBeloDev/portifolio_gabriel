import type { Metadata } from "next";
import { SocialLinks } from "@/components/social-links";

export const metadata: Metadata = {
  title: "sobre",
  description: "Quem escreve e constrói este site.",
};

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
    <h2 className="mt-10 mb-4 font-display text-2xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-10 sm:py-14">
      <p className="mb-2 font-mono text-sm text-muted-2"># sobre.md</p>
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-[46px]">
        Oi, eu sou o Gabriel.
      </h1>
      <p className="mt-3 max-w-prose text-lg leading-relaxed text-muted">
        Dev. Construo coisas na web e escrevo sobre o processo, porque escrever
        é o jeito mais honesto que encontrei de{" "}
        <span className="text-accent">entender o que estou estudando</span>. Se
        você chegou aqui por um post, esta página é o contexto de quem escreve.
      </p>

      <SectionHeading>Agora</SectionHeading>
      <p className="max-w-prose leading-relaxed text-muted">
        Estou aprofundando em infraestrutura moderna — Kubernetes, Terraform,
        observabilidade. Não é estudo de véspera de prova: a meta é que cada
        aprendizado vire um estudo publicado aqui, com as decisões e os erros no
        meio do caminho, não só o resultado.
      </p>

      <SectionHeading>Este site</SectionHeading>
      <p className="max-w-prose leading-relaxed text-muted">
        Este site também é um trabalho — talvez o mais honesto deles, porque dá
        pra auditar. É um monorepo com design system próprio, conteúdo tipado
        que quebra o build se eu errar, e CI que publica sozinho a cada merge. O
        código é aberto e está no{" "}
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

      <SectionHeading>Stack &amp; ferramentas</SectionHeading>
      <p className="mb-4 max-w-prose leading-relaxed text-muted">
        O que este repositório usa no dia a dia:
      </p>
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

      <SectionHeading>Me acha em</SectionHeading>
      <SocialLinks />
    </div>
  );
}
