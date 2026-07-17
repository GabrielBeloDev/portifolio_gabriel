const GITHUB_COMMITS_API =
  "https://api.github.com/repos/GabrielBeloDev/portifolio_gabriel/commits";
const MAX_REVISIONS = 10;
const REVALIDATE_SECONDS = 86400;

type GithubCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { date: string };
  };
};

const commitSubject = (message: string) => message.split("\n")[0] ?? message;
const commitDate = (isoDate: string) => isoDate.slice(0, 10);

type HistorySource = { slug: string } | { path: string };

const resolveFilePath = (source: HistorySource) =>
  "path" in source ? source.path : `apps/web/content/posts/${source.slug}.mdx`;

async function fetchFileCommits(
  filePath: string,
): Promise<GithubCommit[] | null> {
  const url = `${GITHUB_COMMITS_API}?path=${filePath}&per_page=${MAX_REVISIONS}`;

  // Build enhancement must not fail the build: the unauthenticated GitHub API
  // rate-limits at 60 req/h and the network may be down — warn and skip.
  try {
    const response = await fetch(url, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      console.warn(
        `post-history: GitHub API ${response.status} for ${filePath}`,
      );
      return null;
    }
    return (await response.json()) as GithubCommit[];
  } catch (error) {
    console.warn(`post-history: GitHub API unreachable for ${filePath}`, error);
    return null;
  }
}

export async function PostHistory(props: HistorySource) {
  const commits = await fetchFileCommits(resolveFilePath(props));
  if (commits === null || commits.length === 0) return null;

  return (
    <details className="mt-12 rounded-md border border-line bg-surface px-4 py-3">
      <summary className="cursor-pointer font-mono text-xs tracking-[0.1em] text-muted-2">
        <span aria-hidden="true">{"// "}</span>
        revisões deste arquivo ({commits.length})
      </summary>
      <ul className="mt-3.5 space-y-2 font-mono text-xs text-muted">
        {commits.map((commit) => (
          <li key={commit.sha}>
            <a
              href={commit.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent transition-colors hover:underline"
            >
              {commit.sha.slice(0, 7)}
            </a>{" "}
            · {commitSubject(commit.commit.message)} ·{" "}
            <time dateTime={commitDate(commit.commit.author.date)}>
              {commitDate(commit.commit.author.date)}
            </time>
          </li>
        ))}
      </ul>
    </details>
  );
}
