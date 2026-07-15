import type { Metadata } from "next";
import { RuledPage, RuledSection } from "@gabriel/ui";

export const metadata: Metadata = {
  title: "sobre",
  description: "Quem escreve e constrói este site.",
};

export default function AboutPage() {
  return (
    <RuledPage className="mx-auto max-w-3xl px-6 pb-16">
      <RuledSection>
        <h1 className="text-3xl font-semibold">sobre</h1>
        <div className="prose mt-8">
          <p>
            Sou o Gabriel — dev. Construo coisas na web e escrevo sobre o
            processo, porque escrever é o jeito mais honesto que encontrei de
            entender o que estou estudando.
          </p>
          <p>
            No momento estou aprofundando em infraestrutura moderna —
            Kubernetes, Terraform, observabilidade — com a meta de que cada
            aprendizado vire um estudo publicado aqui.
          </p>
          <p>
            Este site também é um trabalho: monorepo, design system próprio e
            conteúdo tipado. O código é aberto e está no{" "}
            <a
              href="https://github.com/GabrielBeloDev/portifolio_gabriel"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
            .
          </p>
        </div>
      </RuledSection>
    </RuledPage>
  );
}
