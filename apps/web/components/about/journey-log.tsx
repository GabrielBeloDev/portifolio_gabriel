import { publishedCaseStudies, publishedPosts } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { GITHUB_PROFILE_URL } from "@/lib/site";

import { fetchFirstSiteCommit, fetchGithubProfile } from "./github-data";
import { PERSONAL_MILESTONES, type JourneyMilestone } from "./owner-content";

async function buildVerifiableMilestones(): Promise<JourneyMilestone[]> {
  const [profile, firstCommit] = await Promise.all([
    fetchGithubProfile(),
    fetchFirstSiteCommit(),
  ]);

  const milestones: JourneyMilestone[] = [
    ...publishedPosts.map((post) => ({
      date: post.date,
      label: `publiquei “${post.title}”`,
      href: `/blog/${post.slug}`,
    })),
    ...publishedCaseStudies.map((study) => ({
      date: study.date,
      label: `publiquei o estudo “${study.title}”`,
      href: `/estudos/${study.slug}`,
    })),
  ];

  if (profile) {
    milestones.push({
      date: profile.createdAt,
      label: "criei a conta @GabrielBeloDev no GitHub",
      href: GITHUB_PROFILE_URL,
      external: true,
    });
  }
  if (firstCommit) {
    milestones.push({
      date: firstCommit.date,
      label: "primeiro commit deste site",
      href: firstCommit.htmlUrl,
      external: true,
    });
  }

  return milestones;
}

function MilestoneLabel({ milestone }: { milestone: JourneyMilestone }) {
  if (!milestone.href) return <>{milestone.label}</>;
  return (
    <a
      href={milestone.href}
      {...(milestone.external
        ? { target: "_blank", rel: "noopener noreferrer" }
        : {})}
      className="text-link transition-colors hover:text-accent"
    >
      {milestone.label}
      {milestone.external && <span aria-hidden> ↗</span>}
    </a>
  );
}

export async function JourneyLog() {
  const verifiableMilestones = await buildVerifiableMilestones();
  const milestones = [...verifiableMilestones, ...PERSONAL_MILESTONES].sort(
    (a, b) => b.date.localeCompare(a.date),
  );

  return (
    <ol className="ml-1 space-y-3 border-l border-line pl-6">
      {milestones.map((milestone) => (
        <li key={`${milestone.date}-${milestone.label}`} className="relative">
          <span
            aria-hidden
            className="absolute top-[7px] -left-[29px] h-[7px] w-[7px] rounded-full border border-line-2 bg-surface"
          />
          <time
            dateTime={formatDate(milestone.date)}
            className="font-mono text-xs text-muted-2"
          >
            {formatDate(milestone.date)}
          </time>
          <p className="mt-0.5 text-sm leading-relaxed text-muted">
            <MilestoneLabel milestone={milestone} />
          </p>
        </li>
      ))}
    </ol>
  );
}
