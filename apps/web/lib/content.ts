import { caseStudies, posts, projects } from "#velite";
import type { ProjectCategory } from "./draft-type";

const byDateDesc = <T extends { date: string }>(a: T, b: T) =>
  b.date.localeCompare(a.date);

export const publishedPosts = posts
  .filter((post) => !post.draft)
  .sort(byDateDesc);

export const publishedCaseStudies = caseStudies
  .filter((study) => !study.draft)
  .sort(byDateDesc);

export const allProjects = [...projects].sort((a, b) => a.order - b.order);

export function findPost(slug: string) {
  return publishedPosts.find((post) => post.slug === slug);
}

export function findCaseStudy(slug: string) {
  return publishedCaseStudies.find((study) => study.slug === slug);
}

export function findProject(slug: string) {
  return allProjects.find((project) => project.slug === slug);
}

export function findCaseStudyForProject(projectSlug: string) {
  return publishedCaseStudies.find((study) => study.projectSlug === projectSlug);
}

export function projectsByCategory(category: ProjectCategory) {
  return allProjects.filter((project) => project.category === category);
}

export function postsByTag(tag: string) {
  return publishedPosts.filter((post) => post.tags.includes(tag));
}

export function allTags() {
  return [...new Set(publishedPosts.flatMap((post) => post.tags))].sort();
}
