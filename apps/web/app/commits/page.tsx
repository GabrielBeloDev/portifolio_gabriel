import type { Metadata } from "next";
import { formatDateHuman } from "@/lib/format";

const REPO_COMMITS_API =
  "https://api.github.com/repos/GabrielBeloDev/portifolio_gabriel/commits?per_page=30";
const REVALIDATE_SECONDS = 3600;
const PR_MERGE_PATTERN = /\(#\d+\)/;

export const metadata: Metadata = {
  title: "commits",
  description: "O histórico real da main deste repositório, direto do GitHub.",
};

type GithubCommit = {
  sha: string;
  html_url: string;
  commit: {
    message: string;
    author: { name: string; date: string };
  };
};

const commitSubject = (message: string) => message.split("\n")[0] ?? message;
const commitDay = (isoDate: string) => isoDate.slice(0, 10);

// Live enhancement must not fail the build: the unauthenticated GitHub API
// rate-limits at 60 req/h and the network may be down — warn and skip.
async function fetchMainCommits(): Promise<GithubCommit[] | null> {
  try {
    const response = await fetch(REPO_COMMITS_API, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      console.warn(`commits: GitHub API ${response.status} for main history`);
      return null;
    }
    return (await response.json()) as GithubCommit[];
  } catch (error) {
    console.warn("commits: GitHub API unreachable for main history", error);
    return null;
  }
}

function groupByDay(commits: GithubCommit[]): [string, GithubCommit[]][] {
  const groups = new Map<string, GithubCommit[]>();
  for (const commit of commits) {
    const day = commitDay(commit.commit.author.date);
    const dayCommits = groups.get(day);
    if (dayCommits) dayCommits.push(commit);
    else groups.set(day, [commit]);
  }
  return [...groups.entries()];
}

function CommitRow({ commit }: { commit: GithubCommit }) {
  const subject = commitSubject(commit.commit.message);
  const isPrMerge = PR_MERGE_PATTERN.test(subject);

  return (
    <li className="flex items-baseline gap-2.5">
      <span
        aria-hidden
        className={isPrMerge ? "text-accent" : "text-faint"}
        title={isPrMerge ? "merge de pull request" : undefined}
      >
        ●
      </span>
      <span className="min-w-0">
        <a
          href={commit.html_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent transition-colors hover:underline"
        >
          {commit.sha.slice(0, 7)}
        </a>{" "}
        {subject} ·{" "}
        <span className="text-muted-2">{commit.commit.author.name}</span>
      </span>
    </li>
  );
}

export default async function CommitsPage() {
  const commits = await fetchMainCommits();
  const hasHistory = commits !== null && commits.length > 0;

  return (
    <div className="mx-auto max-w-[720px] px-6 py-10 sm:py-14">
      <p className="mb-2 font-mono text-sm text-muted-2"># .git/log</p>
      <h1 className="font-mono text-2xl font-bold tracking-tight sm:text-3xl">
        git log --oneline main
      </h1>
      <p className="mt-3 max-w-prose text-lg leading-relaxed text-muted">
        O histórico <span className="text-accent">real</span> deste repositório,
        direto da API do GitHub — cada linha é um commit que chegou na main.
      </p>

      {hasHistory ? (
        <div className="mt-10 space-y-8">
          {groupByDay(commits).map(([day, dayCommits]) => (
            <section key={day} aria-label={formatDateHuman(day)}>
              <h2 className="font-mono text-xs tracking-[0.14em] text-faint">
                <time dateTime={day}>{formatDateHuman(day)}</time>
              </h2>
              <ul className="mt-3 space-y-2 font-mono text-[13px] text-muted">
                {dayCommits.map((commit) => (
                  <CommitRow key={commit.sha} commit={commit} />
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-10 font-mono text-sm text-muted">
          {"// histórico indisponível agora"}
        </p>
      )}
    </div>
  );
}
