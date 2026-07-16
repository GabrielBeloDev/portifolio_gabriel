import { CtaLink } from "@/components/cta-link";

export function HeroCtas() {
  return (
    <div className="flex flex-wrap gap-3.5">
      <CtaLink href="/blog">ler o blog →</CtaLink>
      <CtaLink href="/sobre" variant="ghost">
        sobre mim
      </CtaLink>
    </div>
  );
}
