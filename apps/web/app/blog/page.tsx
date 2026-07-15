import type { Metadata } from "next";
import { RuledPage, RuledSection, SectionHeading } from "@gabriel/ui";
import { PostRow } from "@/components/post-row";
import { publishedPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "escritos",
  description: "Posts sobre o que estou construindo e estudando.",
};

function groupPostsByYear() {
  const byYear = new Map<string, typeof publishedPosts>();
  for (const post of publishedPosts) {
    const year = post.date.slice(0, 4);
    byYear.set(year, [...(byYear.get(year) ?? []), post]);
  }
  return [...byYear.entries()];
}

export default function BlogPage() {
  const postGroups = groupPostsByYear();

  return (
    <RuledPage className="mx-auto max-w-3xl px-6 pb-16">
      <RuledSection>
        <h1 className="text-3xl font-semibold">escritos</h1>
        <p className="mt-3 max-w-prose text-muted">
          O que estou estudando, lendo e construindo — escrito para eu entender
          melhor.
        </p>
      </RuledSection>
      {postGroups.map(([year, posts]) => (
        <RuledSection key={year}>
          <SectionHeading>{year}</SectionHeading>
          <ul className="mt-2 divide-y divide-line">
            {posts.map((post) => (
              <PostRow
                key={post.slug}
                href={`/blog/${post.slug}`}
                title={post.title}
                date={post.date}
                summary={post.summary}
              />
            ))}
          </ul>
        </RuledSection>
      ))}
    </RuledPage>
  );
}
