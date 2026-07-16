import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { enabledSocialProviders } from "@/lib/auth";

export const metadata: Metadata = {
  title: "entrar",
  description: "Entre para comentar e curtir.",
};

const hasSocial =
  enabledSocialProviders.github || enabledSocialProviders.google;

export default function SignInPage() {
  return (
    <div className="mx-auto w-full max-w-md px-6 pt-14 pb-16">
      <p className="font-mono text-sm tracking-wide text-faint">
        # auth.config
      </p>
      <h1 className="mt-2 text-3xl font-semibold">entrar</h1>
      <p className="mt-3 text-muted">
        {hasSocial
          ? "Entre com uma conta social ou com email para comentar e curtir."
          : "Uma conta aqui serve para comentar e curtir."}
      </p>
      <div className="home-fade-up mt-8 overflow-hidden rounded-md border border-line bg-surface">
        <p className="flex items-center gap-2 border-b border-line bg-background-2 px-4 py-2.5 font-mono text-xs text-faint">
          <span aria-hidden className="size-2 rounded-full bg-accent-fill" />
          auth.config
        </p>
        <div className="p-5">
          <AuthForm social={enabledSocialProviders} />
        </div>
      </div>
    </div>
  );
}
