import { SOCIAL_LINKS } from "@/lib/site";

import { fetchExtraSocialAccounts, fetchGithubProfile } from "./github-data";

const CURRENT_FOCUS = "infra moderna: Kubernetes · Terraform";

interface FrontmatterLink {
  readonly label: string;
  readonly href: string;
  readonly external: boolean;
}

function FrontmatterLine({
  name,
  children,
}: {
  name: string;
  children: React.ReactNode;
}) {
  return (
    <p>
      <span className="text-accent">{name}</span>
      <span className="text-muted-2">:</span> {children}
    </p>
  );
}

export async function AboutFrontmatter() {
  const localLabels = SOCIAL_LINKS.map((social) => social.label);
  const [profile, extraAccounts] = await Promise.all([
    fetchGithubProfile(),
    fetchExtraSocialAccounts(localLabels),
  ]);

  const links: readonly FrontmatterLink[] = [
    ...SOCIAL_LINKS,
    ...extraAccounts.map((account) => ({
      label: account.provider,
      href: account.url,
      external: true,
    })),
  ];

  return (
    <section
      aria-label="frontmatter"
      className="rounded-md border border-line bg-surface px-4 py-3 font-mono text-[13px] leading-relaxed text-muted"
    >
      <p aria-hidden className="text-muted-2">
        ---
      </p>
      <FrontmatterLine name="nome">Gabriel Belo</FrontmatterLine>
      {profile?.bio && (
        <FrontmatterLine name="bio">{profile.bio}</FrontmatterLine>
      )}
      {profile?.location && (
        <FrontmatterLine name="local">{profile.location}</FrontmatterLine>
      )}
      <FrontmatterLine name="foco">&quot;{CURRENT_FOCUS}&quot;</FrontmatterLine>
      {profile?.blog && (
        <FrontmatterLine name="site">
          <a
            href={profile.blog}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link transition-colors hover:text-accent"
          >
            {profile.blog}
          </a>
        </FrontmatterLine>
      )}
      <FrontmatterLine name="links">
        <span className="text-muted-2">[</span>
        {links.map((link, index) => (
          <span key={link.label}>
            {index > 0 && <span className="text-muted-2">, </span>}
            <a
              href={link.href}
              {...(link.external
                ? { target: "_blank", rel: "noopener noreferrer" }
                : {})}
              className="text-link transition-colors hover:text-accent"
            >
              {link.label}
            </a>
          </span>
        ))}
        <span className="text-muted-2">]</span>
      </FrontmatterLine>
      <p aria-hidden className="text-muted-2">
        ---
      </p>
    </section>
  );
}
