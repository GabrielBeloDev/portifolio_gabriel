import Link from "next/link";
import { RuledPage, RuledSection, SectionHeading } from "@gabriel/ui";
import { NowBlock } from "@/components/now-block";
import { PostRow } from "@/components/post-row";
import { ProjectCard } from "@/components/project-card";
import {
  allProjects,
  findCaseStudyForProject,
  publishedCaseStudies,
  publishedPosts,
} from "@/lib/content";

const seeAllLinkClasses =
  "mt-4 inline-block font-mono text-xs text-accent transition-colors hover:underline";

export default function HomePage() {
  const recentPosts = publishedPosts.slice(0, 3);
  const featuredProjects = allProjects.slice(0, 4);
  const recentStudies = publishedCaseStudies.slice(0, 3);

  return (
    <RuledPage className="mx-auto max-w-3xl px-6 pb-16">
      <RuledSection>
        <h1 className="text-3xl font-semibold sm:text-4xl">Gabriel Belo</h1>
        <p className="mt-3 text-lg text-muted">
          dev · escrevo sobre o que construo
        </p>
        <p className="mt-6 max-w-prose text-muted">
          Este site é meu caderno público: o que construo vira projeto, o que
          estudo vira escrita.
        </p>
        <div className="mt-8">
          <NowBlock />
        </div>
      </RuledSection>

      <RuledSection>
        <SectionHeading>escritos</SectionHeading>
        <ul className="mt-2 divide-y divide-line">
          {recentPosts.map((post) => (
            <PostRow
              key={post.slug}
              href={`/blog/${post.slug}`}
              title={post.title}
              date={post.date}
              summary={post.summary}
            />
          ))}
        </ul>
        <Link href="/blog" className={seeAllLinkClasses}>
          todos os escritos →
        </Link>
      </RuledSection>

      <RuledSection>
        <SectionHeading>trabalhos</SectionHeading>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {featuredProjects.map((project) => (
            <ProjectCard
              key={project.slug}
              project={project}
              studySlug={findCaseStudyForProject(project.slug)?.slug}
            />
          ))}
        </div>
        <Link href="/projects" className={seeAllLinkClasses}>
          todos os trabalhos →
        </Link>
      </RuledSection>

      <RuledSection>
        <SectionHeading>estudos</SectionHeading>
        <ul className="mt-2 divide-y divide-line">
          {recentStudies.map((study) => (
            <PostRow
              key={study.slug}
              href={`/estudos/${study.slug}`}
              title={study.title}
              date={study.date}
              summary={study.summary}
            />
          ))}
        </ul>
        <Link href="/estudos" className={seeAllLinkClasses}>
          todos os estudos →
        </Link>
      </RuledSection>
    </RuledPage>
  );
}
