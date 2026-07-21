"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import Link from "next/link";
import { useRef } from "react";
import { formatDate } from "@/lib/format";

export interface VirtualPost {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tag?: string;
}

const ROW_HEIGHT = 132;
const OVERSCAN = 6;

// The blog index is server-rendered below the virtualization threshold, so this
// windowed path only runs once the archive is large enough that shipping every
// row would cost more than the lost SSR of the off-screen ones.
export function VirtualPostList({ posts }: { posts: VirtualPost[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: posts.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  return (
    <div
      ref={parentRef}
      className="max-h-[75vh] overflow-auto border-y border-line"
    >
      <ul
        className="relative w-full"
        style={{ height: virtualizer.getTotalSize() }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const post = posts[virtualRow.index];
          if (!post) return null;
          return (
            <li
              key={post.slug}
              data-index={virtualRow.index}
              ref={virtualizer.measureElement}
              className="absolute top-0 left-0 w-full"
              style={{ transform: `translateY(${virtualRow.start}px)` }}
            >
              <Link
                href={`/blog/${post.slug}`}
                className="group block border-b border-line px-4 py-[22px] transition-[background-color,padding-left] duration-200 hover:bg-surface hover:pl-7"
              >
                <p className="flex items-baseline gap-3.5 font-mono">
                  <span className="text-[13px] text-accent">
                    {String(virtualRow.index + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs text-muted-2">
                    <time dateTime={post.date.slice(0, 10)}>
                      {formatDate(post.date)}
                    </time>
                    {post.tag !== undefined && <> · {post.tag}</>}
                  </span>
                </p>
                <h2 className="mt-2 font-display text-2xl font-semibold">
                  {post.title}
                </h2>
                <p className="mt-1.5 text-[15.5px] leading-[1.6] text-muted">
                  {post.summary}
                </p>
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
