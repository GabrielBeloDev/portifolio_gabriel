import { ArrowUpRight } from "lucide-react";
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
    <div className="mx-auto max-w-3xl px-6">
      <div className="relative border-l border-line py-12 pl-6 sm:pl-10">
        <ReadingProgress
          className="-left-px"
          scrollContainerId={CONTENT_SCROLL_CONTAINER_ID}
        />
        <article>
          <header>
            <p className="font-mono text-xs text-muted">
              estudo ·{" "}
              <time dateTime={study.date.slice(0, 10)}>
                {formatDate(study.date)}
              </time>{" "}
              · {study.metadata.readingTime} min de leitura
            </p>
            <h1 className="mt-2 text-3xl leading-tight font-semibold">
              {study.title}
            </h1>
            <p className="mt-3 text-muted">{study.summary}</p>
            {project && projectUrl && (
              <p className="mt-4 border-l-2 border-accent pl-3 font-mono text-xs text-muted">
                sobre o trabalho:{" "}
                <a
                  href={projectUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-accent hover:underline"
                >
                  {project.title} <ArrowUpRight aria-hidden className="size-3" />
                </a>
              </p>
            )}
          </header>
          <div className="prose mt-10">
            <MDXContent code={study.code} />
          </div>
        </article>
        <footer className="mt-14">
          <Link
            href="/estudos"
            className="font-mono text-xs text-accent transition-colors hover:underline"
          >
            ← todos os estudos
          </Link>
        </footer>
      </div>
    </div>
  );
}
