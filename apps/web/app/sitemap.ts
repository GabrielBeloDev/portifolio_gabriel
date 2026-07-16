import type { MetadataRoute } from "next";
import { publishedCaseStudies, publishedPosts } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

const FIXED_PUBLIC_PATHS = ["", "/blog", "/estudos", "/projects", "/sobre"];

export default function sitemap(): MetadataRoute.Sitemap {
  const fixedRoutes = FIXED_PUBLIC_PATHS.map((path) => ({
    url: `${SITE_URL}${path}`,
  }));

  const postRoutes = publishedPosts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: post.date,
  }));

  const caseStudyRoutes = publishedCaseStudies.map((study) => ({
    url: `${SITE_URL}/estudos/${study.slug}`,
    lastModified: study.date,
  }));

  return [...fixedRoutes, ...postRoutes, ...caseStudyRoutes];
}
