import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@gabriel/ui";
import { CtaLink } from "@/components/cta-link";
import { CONTENT_SCROLL_CONTAINER_ID } from "@/components/ide/ide-shell";
import { MDXContent } from "@/components/mdx";
import {
  findCaseStudy,
  findProject,
  publishedCaseStudies,
} from "@/lib/content";
import { formatDateHuman } from "@/lib/format";

export function generateStaticParams() {
  return publishedCaseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const study = findCaseStudy(slug);
  if (!study) return {};
  return { title: study.title, description: study.summary };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = findCaseStudy(slug);
  if (!study) notFound();

  const project = study.projectSlug ? findProject(study.projectSlug) : undefined;
  const projectUrl = project?.live ?? project?.repo;

  return (
    <div className="relative mx-auto max-w-[720px] px-6 py-10 sm:py-14">
      <ReadingProgress
        className="left-0"
        scrollContainerId={CONTENT_SCROLL_CONTAINER_ID}
      />
      <article>
        <header>
          <p className="text-sm text-muted-2">
            estudo ·{" "}
            <time dateTime={study.date.slice(0, 10)}>
              {formatDateHuman(study.date)}
            </time>{" "}
            · {study.metadata.readingTime} min de leitura
          </p>
          <h1 className="mt-4 font-display text-4xl leading-[1.08] font-bold tracking-tight sm:text-[44px]">
            {study.title}
          </h1>
          <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">
            {study.summary}
          </p>
          {project && projectUrl && (
            <p className="mt-5 border-l-2 border-accent pl-3 text-sm text-muted">
              sobre o trabalho:{" "}
              <a
                href={projectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-link transition-colors hover:text-accent"
              >
                {project.title} <span aria-hidden>↗</span>
              </a>
            </p>
          )}
        </header>
        <div className="prose mt-10">
          <MDXContent code={study.code} />
        </div>
      </article>
      <footer className="mt-14 border-t border-line pt-6">
        <CtaLink href="/estudos" variant="ghost">
          ← todos os estudos
        </CtaLink>
      </footer>
    </div>
  );
}
