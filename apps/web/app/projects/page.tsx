import type { Metadata } from "next";
import { ProjectCard } from "@/components/project-card";
import { Reveal } from "@/components/reveal";
import {
  allProjects,
  findCaseStudyForProject,
  projectsByCategory,
} from "@/lib/content";
import {
  PROJECT_CATEGORY_LABELS,
  type ProjectCategory,
} from "@/lib/draft-type";

export const metadata: Metadata = {
  title: "trabalhos",
  description: "Coisas que construí.",
};

// Production work leads, coursework next, study sandboxes last
const CATEGORY_ORDER: readonly ProjectCategory[] = [
  "producao",
  "faculdade",
  "legado-de-estudo",
];

export default function ProjectsPage() {
  const groups = CATEGORY_ORDER.map((category) => ({
    category,
    projects: projectsByCategory(category),
  })).filter((group) => group.projects.length > 0);

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
        Coisas que construí, agrupadas pelo que são. Quando um trabalho tem
        história que vale contar, o card aponta para o estudo.
      </p>
      {allProjects.length === 0 ? (
        <p className="mt-10 font-mono text-sm text-muted">
          {"// ainda catalogando os trabalhos"}
        </p>
      ) : (
        <Reveal>
          <div className="mt-10 flex flex-col gap-10">
            {groups.map((group) => (
              <section key={group.category}>
                <h2 className="mb-4 font-mono text-sm text-faint">
                  # {PROJECT_CATEGORY_LABELS[group.category]}
                </h2>
                <div className="grid gap-4 sm:grid-cols-2">
                  {group.projects.map((project) => (
                    <ProjectCard
                      key={project.slug}
                      project={project}
                      studySlug={findCaseStudyForProject(project.slug)?.slug}
                      headingLevel="h3"
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        </Reveal>
      )}
    </div>
  );
}
