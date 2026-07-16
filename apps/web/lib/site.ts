export const SITE_URL =
  "https://portifolio-gabriel-gabriels-projects-c9fd91a7.vercel.app";

export const REPO_URL =
  "https://github.com/GabrielBeloDev/portifolio_gabriel";

export const GITHUB_PROFILE_URL = "https://github.com/GabrielBeloDev";

export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly external: boolean;
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: "github", href: GITHUB_PROFILE_URL, external: true },
  {
    label: "linkedin",
    href: "https://www.linkedin.com/in/gabriel--belo/",
    external: true,
  },
  { label: "email", href: "mailto:gabrielbelodev@outlook.com", external: false },
  {
    label: "instagram",
    href: "https://www.instagram.com/belo__gabriel/",
    external: true,
  },
];
