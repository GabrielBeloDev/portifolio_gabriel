import type { DraftType } from "./draft-type";
import { REPO_URL } from "./site";

const REPO_SLUG = new URL(REPO_URL).pathname.slice(1);
const COMMIT_BRANCH = "main";
const CONTENTS_API_ROOT = `https://api.github.com/repos/${REPO_SLUG}/contents`;

export function contentPath(type: DraftType, slug: string): string {
  switch (type) {
    case "post":
      return `apps/web/content/posts/${slug}.mdx`;
    case "study":
      return `apps/web/content/case-studies/${slug}.mdx`;
    case "project":
      return `apps/web/content/projects/${slug}.yml`;
  }
}

export function postContentPath(slug: string): string {
  return contentPath("post", slug);
}

export function contentsApiUrl(path: string): string {
  return `${CONTENTS_API_ROOT}/${path}`;
}

export function encodeFileContent(content: string): string {
  return Buffer.from(content, "utf8").toString("base64");
}

type CommitPayload = {
  message: string;
  content: string;
  branch: string;
  sha?: string;
};

export function buildCommitPayload(input: {
  message: string;
  content: string;
  sha: string | null;
}): CommitPayload {
  const payload: CommitPayload = {
    message: input.message,
    content: encodeFileContent(input.content),
    branch: COMMIT_BRANCH,
  };
  // A new file has no sha; sending one for a non-existent file is a 422
  if (input.sha !== null) payload.sha = input.sha;
  return payload;
}

// Imported lazily so the pure helpers stay importable (e.g. in unit tests)
// without booting the typed env, which requires runtime-only secrets
async function requireCommitToken(): Promise<string> {
  const { env } = await import("./env");
  if (!env.GITHUB_COMMIT_TOKEN) {
    throw new Error("GITHUB_COMMIT_TOKEN não configurada");
  }
  return env.GITHUB_COMMIT_TOKEN;
}

function authHeaders(token: string): Record<string, string> {
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function fetchExistingSha(
  apiUrl: string,
  token: string,
): Promise<string | null> {
  const response = await fetch(apiUrl, {
    headers: authHeaders(token),
    cache: "no-store",
  });
  // A missing file is expected for a first-time publish, not an error
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(
      `GitHub Contents API respondeu ${response.status} ao ler o arquivo`,
    );
  }
  const data = (await response.json()) as { sha: string };
  return data.sha;
}

export async function commitContentFile(input: {
  path: string;
  content: string;
  message: string;
}): Promise<{ commitUrl: string }> {
  const token = await requireCommitToken();
  const apiUrl = contentsApiUrl(input.path);

  const sha = await fetchExistingSha(apiUrl, token);
  const payload = buildCommitPayload({
    message: input.message,
    content: input.content,
    sha,
  });

  const response = await fetch(apiUrl, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error(
      `GitHub Contents API respondeu ${response.status} ao commitar`,
    );
  }

  const data = (await response.json()) as { commit: { html_url: string } };
  return { commitUrl: data.commit.html_url };
}
