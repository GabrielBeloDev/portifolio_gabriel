import Link from "next/link";
import { Reveal } from "@/components/reveal";
import { ViewCount } from "@/components/view-count";
import { formatDate } from "@/lib/format";

type PostRowProps = {
  href: string;
  title: string;
  date: string;
  summary: string;
  index?: number;
  tag?: string;
  viewsSlug?: string;
  headingLevel?: "h2" | "h3";
  revealDelay?: number;
};

export function PostRow({
  href,
  title,
  date,
  summary,
  index,
  tag,
  viewsSlug,
  headingLevel: Heading = "h3",
  revealDelay,
}: PostRowProps) {
  const row = (
    <Link
      href={href}
      className="group block px-4 py-[22px] transition-[background-color,padding-left] duration-200 hover:bg-surface hover:pl-7"
    >
      <p className="flex items-baseline gap-3.5 font-mono">
        {index !== undefined && (
          <span className="text-[13px] text-accent">
            {String(index).padStart(2, "0")}
          </span>
        )}
        <span className="text-xs text-muted-2">
          <time dateTime={date.slice(0, 10)}>{formatDate(date)}</time>
          {tag !== undefined && <> · {tag}</>}
          {viewsSlug !== undefined && <ViewCount slug={viewsSlug} />}
        </span>
      </p>
      <Heading className="mt-2 font-display text-2xl font-semibold">
        {title}{" "}
        <span
          aria-hidden="true"
          className="inline-block -translate-x-1.5 text-ok opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100"
        >
          →
        </span>
      </Heading>
      <p className="mt-1.5 text-[15.5px] leading-[1.6] text-muted">{summary}</p>
    </Link>
  );

  // Reveal lives inside the li so the ul>li semantics stay valid
  return (
    <li>
      {revealDelay !== undefined ? (
        <Reveal delay={revealDelay}>{row}</Reveal>
      ) : (
        row
      )}
    </li>
  );
}
