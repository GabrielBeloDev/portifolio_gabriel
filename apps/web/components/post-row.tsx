import Link from "next/link";
import { formatDate } from "@/lib/format";

type PostRowProps = {
  href: string;
  title: string;
  date: string;
  summary: string;
};

export function PostRow({ href, title, date, summary }: PostRowProps) {
  return (
    <li>
      <Link href={href} className="group block py-4">
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-medium transition-colors group-hover:text-accent">
            {title}
          </h3>
          <time
            dateTime={date.slice(0, 10)}
            className="shrink-0 font-mono text-xs text-muted"
          >
            {formatDate(date)}
          </time>
        </div>
        <p className="mt-1 text-sm text-muted">{summary}</p>
      </Link>
    </li>
  );
}
