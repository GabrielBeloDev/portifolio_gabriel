import { CtaLink } from "@/components/cta-link";

export default function NotFound() {
  return (
    <div className="flex min-h-full flex-col items-start justify-center px-6 py-16 sm:px-[60px]">
      <p className="font-mono text-sm text-faint">
        $ cat {"<"}essa-rota{">"}
      </p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight sm:text-[46px]">
        404 <span className="text-danger">— arquivo não encontrado</span>
      </h1>
      <p className="mt-3 max-w-prose font-mono text-sm leading-relaxed text-muted">
        {"// o arquivo foi movido, renomeado ou nunca existiu."}
      </p>
      <CtaLink href="/" className="mt-8">
        ← voltar para home.tsx
      </CtaLink>
    </div>
  );
}
