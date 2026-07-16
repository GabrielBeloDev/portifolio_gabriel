import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ReadingProgress } from "@gabriel/ui";
import { CONTENT_SCROLL_CONTAINER_ID } from "@/components/ide/ide-shell";
import { MDXContent } from "@/components/mdx";
import {
  findCaseStudy,
  findProject,
  publishedCaseStudies,
} from "@/lib/content";
import { formatDate } from "@/lib/format";

const GUTTER_LINES = Array.from({ length: 28 }, (_, index) => index + 1);

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
    <div className="flex">
      <div
        aria-hidden
        className="hidden w-14 shrink-0 pt-14 pr-4 text-right font-mono text-xs leading-loose text-faint/60 select-none md:block"
      >
        {GUTTER_LINES.map((line) => (
          <div key={line}>{line}</div>
        ))}
      </div>

      <div className="relative max-w-3xl min-w-0 flex-1 border-l border-line px-6 py-12 pb-20 md:px-10 md:py-14">
        <ReadingProgress
          className="-left-px"
          scrollContainerId={CONTENT_SCROLL_CONTAINER_ID}
        />
        <article>
          <header>
            <p className="font-mono text-[12.5px] text-faint">
              --- <span className="text-accent">estudo</span> ·{" "}
              <time dateTime={study.date.slice(0, 10)}>
                {formatDate(study.date)}
              </time>{" "}
              · {study.metadata.readingTime} min ---
            </p>
            <h1 className="mt-4 font-display text-4xl leading-[1.08] font-bold tracking-tight sm:text-[44px]">
              {study.title}
            </h1>
            <p className="mt-4 max-w-prose text-lg leading-relaxed text-muted">
              {study.summary}
            </p>
            {project && projectUrl && (
              <p className="mt-5 border-l-2 border-accent pl-3 font-mono text-xs text-muted">
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
          <Link
            href="/estudos"
            className="font-mono text-[13px] text-link transition-colors hover:text-accent"
          >
            ← todos os estudos
          </Link>
        </footer>
      </div>
    </div>
  );
}
