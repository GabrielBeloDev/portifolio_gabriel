import { publishedCaseStudies, publishedPosts } from "@/lib/content";
import { formatDate } from "@/lib/format";

import { fetchFirstSiteCommit } from "./github-data";

interface TagCount {
  readonly name: string;
  readonly count: number;
}

function aggregateTags(): TagCount[] {
  const counts = new Map<string, number>();
  for (const post of publishedPosts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

export async function SiteStats() {
  const firstCommit = await fetchFirstSiteCommit();
  const tags = aggregateTags();

  const stats = [
    { label: "posts", value: String(publishedPosts.length) },
    { label: "estudos", value: String(publishedCaseStudies.length) },
    ...(firstCommit
      ? [{ label: "primeiro commit", value: formatDate(firstCommit.date) }]
      : []),
  ];

  return (
    <div className="mt-6">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-line bg-surface px-4 py-3"
          >
            <dt className="font-mono text-xs text-muted-2">{stat.label}</dt>
            <dd className="mt-1 font-display text-xl font-semibold tracking-tight">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
      {tags.length > 0 && (
        <div className="mt-6">
          <p className="mb-3 font-mono text-xs tracking-[0.1em] text-muted-2">
            <span aria-hidden>{"// "}</span>
            sobre o que escrevo
          </p>
          <ul className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <li key={tag.name}>
                <span className="rounded-lg border border-line bg-surface px-3 py-1.5 font-mono text-[13px] text-muted">
                  {tag.name}
                  {tag.count > 1 && (
                    <span className="text-muted-2"> ×{tag.count}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
