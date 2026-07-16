import type { Metadata } from "next";
import Link from "next/link";
import { publishedCaseStudies } from "@/lib/content";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "estudos",
  description:
    "Estudos de caso: como as coisas foram construídas, decisão por decisão.",
};

const formatRowNumber = (index: number) => String(index + 1).padStart(2, "0");

export default function CaseStudiesPage() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-12 pb-20 md:px-10 md:py-14">
      <p className="mb-2.5 font-mono text-sm text-muted-2">
        const estudos = await getAll(
        <span className="text-ok">&apos;estudos&apos;</span>)
      </p>
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-[46px]">
        Estudos
      </h1>
      <p className="mt-2 max-w-prose text-lg text-muted-2">
        Histórias de construção: o problema, as decisões e o que saiu delas.{" "}
        <span className="text-accent">
          {publishedCaseStudies.length}{" "}
          {publishedCaseStudies.length === 1 ? "estudo" : "estudos"}
        </span>
        .
      </p>
      {publishedCaseStudies.length === 0 ? (
        <p className="mt-9 font-mono text-sm text-muted">
          {"// nenhum estudo ainda"}
        </p>
      ) : (
        <StudyList />
      )}
    </div>
  );
}

function StudyList() {
  return (
    <ul className="mt-9 border-b border-line">
      {publishedCaseStudies.map((study, index) => (
          <li key={study.slug} className="border-t border-line">
            <Link
              href={`/estudos/${study.slug}`}
              className="group block px-4 py-5 transition-[background-color,padding] duration-200 hover:bg-surface hover:pl-7"
            >
              <div className="flex items-baseline gap-3.5">
                <span className="font-mono text-[13px] text-accent">
                  {formatRowNumber(index)}
                </span>
                <span className="font-mono text-xs text-muted-2">
                  <time dateTime={study.date.slice(0, 10)}>
                    {formatDate(study.date)}
                  </time>{" "}
                  · {study.metadata.readingTime} min
                </span>
              </div>
              <h2 className="mt-2 font-display text-2xl font-semibold">
                {study.title}{" "}
                <span
                  aria-hidden
                  className="inline-block -translate-x-1.5 text-ok opacity-0 transition duration-200 group-hover:translate-x-0 group-hover:opacity-100"
                >
                  →
                </span>
              </h2>
              <p className="mt-1.5 max-w-prose text-[15px] leading-relaxed text-muted">
                {study.summary}
              </p>
            </Link>
          </li>
      ))}
    </ul>
  );
}
