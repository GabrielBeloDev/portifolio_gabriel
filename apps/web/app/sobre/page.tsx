import type { Metadata } from "next";
import Image from "next/image";

import { AboutFrontmatter } from "@/components/about/about-frontmatter";
import { JourneyLog } from "@/components/about/journey-log";
import { CONTACT_CTA, LESSONS_LEARNED } from "@/components/about/owner-content";
import { SiteStats } from "@/components/about/site-stats";
import { SkillsPanel } from "@/components/about/skills-panel";
import gabrielPhoto from "@/components/home/gabriel.jpg";
import { NowPanel } from "@/components/home/now-panel";
import { PostHistory } from "@/components/post-history";
import { SocialLinks } from "@/components/social-links";
import { REPO_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "sobre",
  description: "Quem escreve e constrói este site.",
};

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-12 mb-5 font-display text-2xl font-semibold tracking-tight">
      <span
        aria-hidden
        className="mr-2 font-mono text-lg font-normal text-muted-2"
      >
        ##
      </span>
      {children}
    </h2>
  );
}

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-[720px] px-6 py-10 sm:py-14">
      <p className="mb-4 font-mono text-sm text-muted-2"># sobre.md</p>
      <AboutFrontmatter />

      <div className="mt-9 flex flex-col gap-6 sm:flex-row sm:items-center">
        <Image
          src={gabrielPhoto}
          alt="Gabriel Belo"
          placeholder="blur"
          sizes="112px"
          className="h-28 w-28 shrink-0 rounded-xl border border-line object-cover"
        />
        <div>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-[42px]">
            Oi, eu sou o Gabriel.
          </h1>
          <p className="mt-3 max-w-prose leading-relaxed text-muted">
            Dev. Construo coisas na web e escrevo sobre o processo, porque
            escrever é o jeito mais honesto que encontrei de{" "}
            <span className="text-accent">entender o que estou estudando</span>.
            Se você chegou aqui por um post, esta página é o contexto de quem
            escreve.
          </p>
        </div>
      </div>

      <SectionHeading>jornada</SectionHeading>
      <JourneyLog />

      <SectionHeading>domino / aprendendo</SectionHeading>
      <SkillsPanel />

      {LESSONS_LEARNED.length > 0 && (
        <>
          <SectionHeading>o que mais me ensinou</SectionHeading>
          <ul className="space-y-4">
            {LESSONS_LEARNED.map((entry) => (
              <li key={entry.project}>
                <p className="font-medium">{entry.project}</p>
                <p className="mt-1 max-w-prose leading-relaxed text-muted">
                  {entry.lesson}
                </p>
              </li>
            ))}
          </ul>
        </>
      )}

      <SectionHeading>este site</SectionHeading>
      <p className="max-w-prose leading-relaxed text-muted">
        Este site também é um trabalho — talvez o mais honesto deles, porque dá
        pra auditar. É um monorepo com design system próprio, conteúdo tipado
        que quebra o build se eu errar, e CI que publica sozinho a cada merge. O
        código é aberto e está no{" "}
        <a
          href={REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="border-b border-link/35 text-link transition-colors hover:border-link"
        >
          GitHub
        </a>
        .
      </p>
      <SiteStats />

      <SectionHeading>agora</SectionHeading>
      <p className="max-w-prose leading-relaxed text-muted">
        Estou aprofundando em infraestrutura moderna — Kubernetes, Terraform,
        observabilidade. Não é estudo de véspera de prova: a meta é que cada
        aprendizado vire um estudo publicado aqui, com as decisões e os erros no
        meio do caminho, não só o resultado.
      </p>
      <div className="mt-5">
        <NowPanel />
      </div>

      <SectionHeading>me acha em</SectionHeading>
      <SocialLinks />
      {CONTACT_CTA !== null && (
        <p className="mt-4 max-w-prose leading-relaxed text-muted">
          {CONTACT_CTA}
        </p>
      )}

      <PostHistory path="apps/web/app/sobre/page.tsx" />
    </div>
  );
}
