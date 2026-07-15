import type { Metadata } from "next";
import { RuledPage, RuledSection } from "@gabriel/ui";
import { ProjectCard } from "@/components/project-card";
import { allProjects, findCaseStudyForProject } from "@/lib/content";

export const metadata: Metadata = {
  title: "trabalhos",
  description: "Coisas que construí.",
};

export default function ProjectsPage() {
  return (
    <RuledPage className="mx-auto max-w-3xl px-6 pb-16">
      <RuledSection>
        <h1 className="text-3xl font-semibold">trabalhos</h1>
        <p className="mt-3 max-w-prose text-muted">
          Coisas que construí. Quando um trabalho tem história que vale contar,
          o card aponta para o estudo.
        </p>
        {allProjects.length === 0 ? (
          <p className="mt-10 font-mono text-sm text-muted">
            // ainda catalogando os trabalhos
          </p>
        ) : (
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
        )}
      </RuledSection>
    </RuledPage>
  );
}
