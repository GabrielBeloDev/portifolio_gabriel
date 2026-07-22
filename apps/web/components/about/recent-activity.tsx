import { fetchRecentSiteCommits } from "./github-data";

// The public commit history is mostly this portfolio (work at SplitC is
// private), so the panel is framed as activity on this site, not as a résumé.
export async function RecentActivity() {
  const commits = await fetchRecentSiteCommits();
  if (commits === null || commits.length === 0) return null;

  return (
    <div className="mt-6 rounded-md border border-line bg-surface px-4 py-3">
      <p className="font-mono text-xs tracking-[0.1em] text-muted-2">
        <span aria-hidden>{"// "}</span>o que mexi neste site ultimamente
      </p>
      <ul className="mt-3 space-y-2 font-mono text-xs text-muted">
        {commits.map((commit) => (
          <li key={commit.sha} className="flex gap-2">
            <a
              href={commit.htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-accent transition-colors hover:underline"
            >
              {commit.sha}
            </a>
            <span className="min-w-0 flex-1 truncate">{commit.subject}</span>
            <time dateTime={commit.date} className="shrink-0 text-muted-2">
              {commit.date}
            </time>
          </li>
        ))}
      </ul>
    </div>
  );
}
