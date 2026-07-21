import Link from "next/link";
import type { Project } from "#velite";
import { PROJECT_CATEGORY_LABELS } from "@/lib/draft-type";

const cardLinkClasses =
  "font-mono text-[13px] text-link transition-colors hover:text-accent";

export function ProjectCard({
  project,
  studySlug,
  headingLevel: Heading = "h3",
}: {
  project: Project;
  studySlug?: string;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <article className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-5 transition-colors hover:border-line-2 hover:bg-background-2">
      <div>
        <span className="mb-2 inline-block rounded-md border border-line bg-background-2 px-2 py-0.5 font-mono text-[11px] text-muted-2">
          {PROJECT_CATEGORY_LABELS[project.category]}
        </span>
        <Heading className="font-display text-xl font-semibold">
          {project.title}
        </Heading>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          {project.summary}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        {project.stack.map((tech) => (
          <span
            key={tech}
            className="rounded-lg border border-line bg-background-2 px-2.5 py-1 font-mono text-xs text-muted"
          >
            {tech}
          </span>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-5 pt-1">
        {project.repo && (
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className={cardLinkClasses}
          >
            repo <span aria-hidden>↗</span>
          </a>
        )}
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className={cardLinkClasses}
          >
            live <span aria-hidden>↗</span>
          </a>
        )}
        {studySlug && (
          <Link href={`/estudos/${studySlug}`} className={cardLinkClasses}>
            estudo <span aria-hidden>→</span>
          </Link>
        )}
      </div>
    </article>
  );
}
