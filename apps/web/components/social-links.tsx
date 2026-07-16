import { SOCIAL_LINKS } from "@/lib/site";

export function SocialLinks() {
  return (
    <ul className="flex flex-wrap gap-x-5 gap-y-1.5 font-mono text-[13px]">
      {SOCIAL_LINKS.map((social) => (
        <li key={social.label}>
          <a
            href={social.href}
            {...(social.external
              ? { target: "_blank", rel: "noopener noreferrer" }
              : {})}
            className="text-link transition-colors hover:text-accent"
          >
            {social.label}
            {social.external && <span aria-hidden> ↗</span>}
          </a>
        </li>
      ))}
    </ul>
  );
}
