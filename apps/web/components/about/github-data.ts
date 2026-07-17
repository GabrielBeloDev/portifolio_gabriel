const GITHUB_API = "https://api.github.com";
const GITHUB_USER = "GabrielBeloDev";
const SITE_REPO = "portifolio_gabriel";
const REVALIDATE_SECONDS = 86400;
const MAX_LANGUAGE_REQUESTS = 10;

const GITHUB_FETCH_OPTIONS = {
  headers: { Accept: "application/vnd.github+json" },
  next: { revalidate: REVALIDATE_SECONDS },
} satisfies RequestInit;

// Build enhancement must not fail the build: the unauthenticated GitHub API
// rate-limits at 60 req/h and the network may be down — warn and skip.
async function fetchGithubJson<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${GITHUB_API}${path}`, GITHUB_FETCH_OPTIONS);
    if (!response.ok) {
      console.warn(`about: GitHub API ${response.status} for ${path}`);
      return null;
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn(`about: GitHub API unreachable for ${path}`, error);
    return null;
  }
}

const presentOrNull = (value: string | null): string | null => {
  const trimmed = value?.trim() ?? "";
  return trimmed === "" ? null : trimmed;
};

type GithubProfileResponse = {
  bio: string | null;
  blog: string | null;
  location: string | null;
  created_at: string;
};

export interface GithubProfile {
  readonly bio: string | null;
  readonly blog: string | null;
  readonly location: string | null;
  readonly createdAt: string;
}

export async function fetchGithubProfile(): Promise<GithubProfile | null> {
  const profile = await fetchGithubJson<GithubProfileResponse>(
    `/users/${GITHUB_USER}`,
  );
  if (profile === null) return null;
  return {
    bio: presentOrNull(profile.bio),
    blog: presentOrNull(profile.blog),
    location: presentOrNull(profile.location),
    createdAt: profile.created_at,
  };
}

type SocialAccountResponse = {
  provider: string;
  url: string;
};

export interface ExtraSocialAccount {
  readonly provider: string;
  readonly url: string;
}

export async function fetchExtraSocialAccounts(
  localLabels: readonly string[],
): Promise<readonly ExtraSocialAccount[]> {
  const accounts = await fetchGithubJson<SocialAccountResponse[]>(
    `/users/${GITHUB_USER}/social_accounts`,
  );
  if (accounts === null) return [];
  // Local SOCIAL_LINKS win on conflict; the GitHub profile only contributes
  // networks that are missing locally
  const knownLabels = new Set(localLabels.map((label) => label.toLowerCase()));
  return accounts.filter(
    (account) => !knownLabels.has(account.provider.toLowerCase()),
  );
}

type RepoResponse = {
  name: string;
  fork: boolean;
};

export interface LanguageShare {
  readonly name: string;
  readonly percent: number;
}

export async function fetchPublicRepoLanguages(): Promise<
  readonly LanguageShare[] | null
> {
  const repos = await fetchGithubJson<RepoResponse[]>(
    `/users/${GITHUB_USER}/repos?sort=updated&per_page=100`,
  );
  if (repos === null) return null;
  // Forks are mostly other people's code — only original repos count here
  const ownRepos = repos
    .filter((repo) => !repo.fork)
    .slice(0, MAX_LANGUAGE_REQUESTS);
  const perRepoLanguages = await Promise.all(
    ownRepos.map((repo) =>
      fetchGithubJson<Record<string, number>>(
        `/repos/${GITHUB_USER}/${repo.name}/languages`,
      ),
    ),
  );

  const bytesByLanguage = new Map<string, number>();
  for (const languages of perRepoLanguages) {
    if (languages === null) continue;
    for (const [language, bytes] of Object.entries(languages)) {
      bytesByLanguage.set(
        language,
        (bytesByLanguage.get(language) ?? 0) + bytes,
      );
    }
  }

  const totalBytes = [...bytesByLanguage.values()].reduce(
    (sum, bytes) => sum + bytes,
    0,
  );
  if (totalBytes === 0) return null;

  return [...bytesByLanguage.entries()]
    .map(([name, bytes]) => ({ name, percent: (bytes / totalBytes) * 100 }))
    .sort((a, b) => b.percent - a.percent);
}

type CommitResponse = {
  html_url: string;
  commit: { author: { date: string } };
};

export interface FirstSiteCommit {
  readonly date: string;
  readonly htmlUrl: string;
}

const parseLastPageUrl = (linkHeader: string | null): string | null =>
  linkHeader?.match(/<([^>]+)>;\s*rel="last"/)?.[1] ?? null;

export async function fetchFirstSiteCommit(): Promise<FirstSiteCommit | null> {
  // The commits API lists newest first, so the oldest commit lives on the
  // last page — probe page 1 just to discover it via the Link header
  const firstPageUrl = `${GITHUB_API}/repos/${GITHUB_USER}/${SITE_REPO}/commits?per_page=1`;
  try {
    const firstPage = await fetch(firstPageUrl, GITHUB_FETCH_OPTIONS);
    if (!firstPage.ok) {
      console.warn(`about: GitHub API ${firstPage.status} for site commits`);
      return null;
    }
    const lastPageUrl = parseLastPageUrl(firstPage.headers.get("link"));
    const lastPage =
      lastPageUrl === null
        ? firstPage
        : await fetch(lastPageUrl, GITHUB_FETCH_OPTIONS);
    if (!lastPage.ok) {
      console.warn(`about: GitHub API ${lastPage.status} for site commits`);
      return null;
    }
    const commits = (await lastPage.json()) as CommitResponse[];
    const oldest = commits[0];
    if (!oldest) return null;
    return { date: oldest.commit.author.date, htmlUrl: oldest.html_url };
  } catch (error) {
    console.warn("about: GitHub API unreachable for site commits", error);
    return null;
  }
}
