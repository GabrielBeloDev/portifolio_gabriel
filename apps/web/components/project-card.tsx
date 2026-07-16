import Link from "next/link";
import type { Project } from "#velite";

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
