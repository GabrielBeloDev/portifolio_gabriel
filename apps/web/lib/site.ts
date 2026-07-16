export const REPO_URL =
  "https://github.com/GabrielBeloDev/portifolio_gabriel";

export interface SocialLink {
  readonly label: string;
  readonly href: string;
  readonly external: boolean;
}

export const SOCIAL_LINKS: readonly SocialLink[] = [
  { label: "github", href: "https://github.com/GabrielBeloDev", external: true },
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
