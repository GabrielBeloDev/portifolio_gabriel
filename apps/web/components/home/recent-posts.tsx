import Link from "next/link";
import { publishedPosts } from "@/lib/content";

const recentPosts = publishedPosts.slice(0, 3);

export function RecentPosts() {
  return (
    <ul className="divide-y divide-line-2 border-y border-line-2">
      {recentPosts.map((post, index) => (
        <li key={post.slug}>
          <Link
            href={`/blog/${post.slug}`}
            className="group grid grid-cols-[32px_1fr_auto] items-baseline gap-4 py-[15px] transition-[background-color,padding] duration-200 hover:bg-surface hover:pl-3.5"
          >
            <span className="font-mono text-[13px] text-accent">
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="text-[17px]">
              {post.title}{" "}
              <span
                aria-hidden
                className="inline-block -translate-x-1.5 text-ok opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-x-0 group-hover:opacity-100"
              >
                →
              </span>
            </span>
            <span className="font-mono text-xs text-faint">
              {post.tags[0]}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
