import Link from "next/link";
import { CtaLink } from "@/components/cta-link";

const STACK_FRAMES = [
  { label: "home.tsx", href: "/" },
  { label: "blog/index.tsx", href: "/blog" },
  { label: "projetos/index.tsx", href: "/projects" },
  { label: "sobre.md", href: "/sobre" },
] as const;

const FRAME_LINK_CLASSES =
  "block rounded px-2 py-0.5 text-muted-2 transition-colors hover:bg-surface hover:text-accent";

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
      <div className="mt-8 w-full max-w-xl rounded-[9px] border border-line bg-code p-4 font-mono text-sm">
        <p className="text-danger">
          Uncaught RouteNotFoundError: arquivo não encontrado
        </p>
        <ul className="mt-2">
          {STACK_FRAMES.map((frame) => (
            <li key={frame.href}>
              <Link href={frame.href} className={`${FRAME_LINK_CLASSES} pl-6`}>
                at {frame.label}:1
              </Link>
            </li>
          ))}
          <li className="mt-2">
            <Link href="/" className={FRAME_LINK_CLASSES}>
              Continuar (F5)
            </Link>
          </li>
        </ul>
      </div>
      <CtaLink href="/" className="mt-8">
        ← voltar para home.tsx
      </CtaLink>
    </div>
  );
}
