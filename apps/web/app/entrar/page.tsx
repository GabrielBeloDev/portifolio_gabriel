import type { Metadata } from "next";
import { RuledPage, RuledSection } from "@gabriel/ui";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "entrar",
  description: "Entre para comentar e curtir.",
};

export default function SignInPage() {
  return (
    <RuledPage className="mx-auto max-w-3xl px-6 pb-16">
      <RuledSection>
        <h1 className="text-3xl font-semibold">entrar</h1>
        <p className="mt-3 max-w-prose text-muted">
          Uma conta aqui serve para comentar e curtir. Login social chega em
          breve.
        </p>
        <div className="mt-10 max-w-sm">
          <AuthForm />
        </div>
      </RuledSection>
    </RuledPage>
  );
}
