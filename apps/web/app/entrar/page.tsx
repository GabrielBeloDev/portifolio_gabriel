import type { Metadata } from "next";
import { RuledPage, RuledSection } from "@gabriel/ui";
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
    <RuledPage className="mx-auto max-w-3xl px-6 pb-16">
      <RuledSection>
        <h1 className="text-3xl font-semibold">entrar</h1>
        <p className="mt-3 max-w-prose text-muted">
          {hasSocial
            ? "Entre com uma conta social ou com email para comentar e curtir."
            : "Uma conta aqui serve para comentar e curtir."}
        </p>
        <div className="mt-10 max-w-sm">
          <AuthForm social={enabledSocialProviders} />
        </div>
      </RuledSection>
    </RuledPage>
  );
}
