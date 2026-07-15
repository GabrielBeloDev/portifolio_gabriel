import type { Metadata } from "next";
import { RuledPage, RuledSection } from "@gabriel/ui";
import { PostRow } from "@/components/post-row";
import { publishedCaseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "estudos",
  description:
    "Estudos de caso: como as coisas foram construídas, decisão por decisão.",
};

export default function CaseStudiesPage() {
  return (
    <RuledPage className="mx-auto max-w-3xl px-6 pb-16">
      <RuledSection>
        <h1 className="text-3xl font-semibold">estudos</h1>
        <p className="mt-3 max-w-prose text-muted">
          Histórias de construção: o problema, as decisões e o que saiu delas.
          Alguns estudos apontam para um trabalho; outros são sobre técnica ou
          processo.
        </p>
        <ul className="mt-8 divide-y divide-line">
          {publishedCaseStudies.map((study) => (
            <PostRow
              key={study.slug}
              href={`/estudos/${study.slug}`}
              title={study.title}
              date={study.date}
              summary={study.summary}
            />
          ))}
        </ul>
      </RuledSection>
    </RuledPage>
  );
}
