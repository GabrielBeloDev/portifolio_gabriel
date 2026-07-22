import type { Metadata } from "next";
import Image from "next/image";

import { AboutFrontmatter } from "@/components/about/about-frontmatter";
import { CareerTimeline } from "@/components/about/career-timeline";
import {
  ARCHITECTURE_TAKE,
  CONTACT_CTA,
  FAILURE_TAKE,
  FORMATIVE_PROJECTS,
  OFF_CODE,
  OWNER_INTRO,
  RECOGNITION,
  SKILLS_LEAD,
  WORK_NOW,
} from "@/components/about/owner-content";
import { RecentActivity } from "@/components/about/recent-activity";
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

function Prose({ paragraphs }: { paragraphs: readonly string[] }) {
  return (
    <div className="space-y-4">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="max-w-prose leading-relaxed text-muted">
          {paragraph}
        </p>
      ))}
    </div>
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
            {OWNER_INTRO}
          </p>
        </div>
      </div>

      <SectionHeading>trajetória</SectionHeading>
      <CareerTimeline />

      <SectionHeading>no que trabalho hoje</SectionHeading>
      <Prose paragraphs={WORK_NOW} />
      <RecentActivity />

      <SectionHeading>projetos que me formaram</SectionHeading>
      <ul className="space-y-5">
        {FORMATIVE_PROJECTS.map((project) => (
          <li key={project.name}>
            <p className="font-display text-lg font-semibold">{project.name}</p>
            <p className="mt-1 max-w-prose leading-relaxed text-muted">
              {project.text}
            </p>
          </li>
        ))}
      </ul>

      <SectionHeading>reconhecimentos</SectionHeading>
      <ul className="space-y-4">
        {RECOGNITION.map((item) => (
          <li key={item.name} className="flex flex-col gap-1 sm:flex-row sm:gap-4">
            <p className="shrink-0 font-mono text-sm text-accent sm:w-56">
              {item.name}
            </p>
            <p className="max-w-prose leading-relaxed text-muted">{item.text}</p>
          </li>
        ))}
      </ul>

      <SectionHeading>domino / aprendendo</SectionHeading>
      <p className="mb-6 max-w-prose leading-relaxed text-muted">{SKILLS_LEAD}</p>
      <SkillsPanel />

      <SectionHeading>como penso sobre software</SectionHeading>
      <p className="max-w-prose leading-relaxed text-muted">{ARCHITECTURE_TAKE}</p>

      <SectionHeading>errar e ouvir</SectionHeading>
      <p className="max-w-prose leading-relaxed text-muted">{FAILURE_TAKE}</p>

      <SectionHeading>este site</SectionHeading>
      <p className="max-w-prose leading-relaxed text-muted">
        Este site também é um trabalho, talvez o mais honesto deles, porque dá
        pra auditar. É um monorepo com design system próprio, conteúdo tipado que
        quebra o build se eu errar e um CI que publica sozinho a cada merge.
        Também é onde testo IA na prática, o editor sugere pauta e melhora texto,
        os posts ganham um tl;dr gerado sob demanda e dá pra ditar por voz, tudo
        com modelos rodando no Groq. O código é aberto e está no{" "}
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
        Meu foco maior hoje é IA aplicada, entender como ela entra de verdade num
        produto e quais decisões existem por trás disso, junto com infraestrutura
        moderna, Kubernetes, Terraform e observabilidade. Não é estudo de véspera
        de prova, a meta é que cada aprendizado vire um estudo publicado aqui, com
        as decisões e os erros do caminho, não só o resultado.
      </p>
      <div className="mt-5">
        <NowPanel />
      </div>

      <SectionHeading>fora do código</SectionHeading>
      <Prose paragraphs={OFF_CODE} />

      <SectionHeading>me acha em</SectionHeading>
      <SocialLinks />
      <p className="mt-4 max-w-prose leading-relaxed text-muted">{CONTACT_CTA}</p>

      <PostHistory path="apps/web/app/sobre/page.tsx" />
    </div>
  );
}
