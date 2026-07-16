import Link from "next/link";

const ctaBaseClasses = "rounded-[9px] px-[22px] py-3 font-mono text-sm";

export function HeroCtas() {
  return (
    <div className="flex flex-wrap gap-3.5">
      <Link
        href="/blog"
        className={`${ctaBaseClasses} bg-accent-fill font-bold text-on-accent transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-[0_10px_28px_-8px_color-mix(in_srgb,var(--accent-fill)_50%,transparent)]`}
      >
        ler o blog →
      </Link>
      <Link
        href="/sobre"
        className={`${ctaBaseClasses} border border-faint/40 text-foreground`}
      >
        sobre mim
      </Link>
    </div>
  );
}
