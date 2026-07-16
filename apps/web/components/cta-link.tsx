import Link from "next/link";
import { cn } from "@gabriel/ui";

const VARIANT_CLASSES = {
  primary:
    "bg-accent-fill font-bold text-on-accent transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-fill/40 motion-reduce:transform-none motion-reduce:transition-none",
  ghost:
    "border border-line text-muted transition-colors hover:bg-surface hover:text-foreground",
} as const;

export function CtaLink({
  href,
  variant = "primary",
  className,
  children,
}: {
  href: string;
  variant?: keyof typeof VARIANT_CLASSES;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-[9px] px-5 py-3 font-mono text-sm",
        VARIANT_CLASSES[variant],
        className,
      )}
    >
      {children}
    </Link>
  );
}
