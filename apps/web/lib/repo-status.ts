// Workflow-scoped endpoint: the plain /actions/runs list is dominated by the
// uptime workflow (runs every 15 min), which would shadow the real ci verdict
const CI_RUNS_API =
  "https://api.github.com/repos/GabrielBeloDev/portifolio_gabriel/actions/workflows/ci.yml/runs?branch=main&per_page=1";
const REVALIDATE_SECONDS = 300;

export type CiConclusion = "success" | "failure";

type WorkflowRunsResponse = {
  workflow_runs: { conclusion: string | null }[];
};

// Live enhancement must not fail the build: the unauthenticated GitHub API
// rate-limits at 60 req/h and the network may be down — warn and skip.
export async function fetchMainCiConclusion(): Promise<CiConclusion | null> {
  try {
    const response = await fetch(CI_RUNS_API, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: REVALIDATE_SECONDS },
    });
    if (!response.ok) {
      console.warn(`repo-status: GitHub API ${response.status} for ci runs`);
      return null;
    }
    const data = (await response.json()) as WorkflowRunsResponse;
    const conclusion = data.workflow_runs[0]?.conclusion;
    // An in-progress or cancelled run has no verdict to show — fall back
    if (conclusion === "success" || conclusion === "failure") return conclusion;
    return null;
  } catch (error) {
    console.warn("repo-status: GitHub API unreachable for ci runs", error);
    return null;
  }
}
