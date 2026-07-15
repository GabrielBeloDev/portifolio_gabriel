import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import type { Project } from "#velite";
import { Badge, Card, CardDescription, CardTitle } from "@gabriel/ui";

const externalLinkClasses =
  "inline-flex items-center gap-1 text-muted transition-colors hover:text-accent";

export function ProjectCard({
  project,
  studySlug,
  headingLevel = "h3",
}: {
  project: Project;
  studySlug?: string;
  headingLevel?: "h2" | "h3";
}) {
  return (
    <Card className="flex flex-col gap-3 transition-colors hover:border-accent">
      <div>
        <CardTitle as={headingLevel}>{project.title}</CardTitle>
        <CardDescription>{project.summary}</CardDescription>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {project.stack.map((tech) => (
          <Badge key={tech}>{tech}</Badge>
        ))}
      </div>
      <div className="mt-auto flex items-center gap-4 pt-1 font-mono text-xs">
        {project.repo && (
          <a
            href={project.repo}
            target="_blank"
            rel="noopener noreferrer"
            className={externalLinkClasses}
          >
            repo <ArrowUpRight aria-hidden className="size-3" />
          </a>
        )}
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className={externalLinkClasses}
          >
            live <ArrowUpRight aria-hidden className="size-3" />
          </a>
        )}
        {studySlug && (
          <Link
            href={`/estudos/${studySlug}`}
            className="text-accent transition-colors hover:underline"
          >
            estudo →
          </Link>
        )}
      </div>
    </Card>
  );
}
