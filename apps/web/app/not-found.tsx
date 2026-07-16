import Link from "next/link";

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
      <Link
        href="/"
        className="mt-8 rounded-[9px] bg-accent-fill px-5 py-3 font-mono text-sm font-bold text-on-accent transition-[transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-accent-fill/40"
      >
        ← voltar para home.tsx
      </Link>
    </div>
  );
}
