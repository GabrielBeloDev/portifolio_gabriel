import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import { allProjects, findCaseStudyForProject } from "@/lib/content";

export const metadata: Metadata = {
  title: "trabalhos",
  description: "Coisas que construí.",
};

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 pb-20 md:px-10 md:py-14">
      <p className="mb-2.5 font-mono text-sm text-faint">
        const projects = await getAll(
        <span className="text-ok">&apos;projects&apos;</span>)
      </p>
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-[46px]">
        Trabalhos
      </h1>
      <p className="mt-2 max-w-prose text-lg text-muted-2">
        Coisas que construí. Quando um trabalho tem história que vale contar, o
        card aponta para o estudo.
      </p>
      {allProjects.length === 0 ? (
        <p className="mt-10 font-mono text-sm text-muted">
          {"// ainda catalogando os trabalhos"}
        </p>
      ) : (
        <Reveal>
          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {allProjects.map((project) => (
              <ProjectCard
                key={project.slug}
                project={project}
                studySlug={findCaseStudyForProject(project.slug)?.slug}
                headingLevel="h2"
              />
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
