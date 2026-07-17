import Link from "next/link";
import { fetchMainCiConclusion, type CiConclusion } from "@/lib/repo-status";

interface CiBadge {
  readonly glyph: string;
  readonly glyphClass: string;
  readonly label: string;
}

const CI_BADGES: Record<CiConclusion, CiBadge> = {
  success: { glyph: "✓", glyphClass: "text-accent", label: "ci verde" },
  failure: { glyph: "✗", glyphClass: "text-danger", label: "ci vermelho" },
};

// Without a live verdict the statusbar keeps its classic literal
const FALLBACK_BADGE: CiBadge = {
  glyph: "✓",
  glyphClass: "text-accent",
  label: "0 problemas",
};

export async function CiStatus() {
  const conclusion = await fetchMainCiConclusion();
  const badge = conclusion === null ? FALLBACK_BADGE : CI_BADGES[conclusion];

  return (
    <Link
      href="/commits"
      aria-label="histórico de commits"
      className="hidden transition-colors hover:text-foreground sm:inline"
    >
      <span aria-hidden className={badge.glyphClass}>
        {badge.glyph}
      </span>{" "}
      {badge.label}
    </Link>
  );
}
