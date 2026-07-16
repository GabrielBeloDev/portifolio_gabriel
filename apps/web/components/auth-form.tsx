"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, cn } from "@gabriel/ui";
import { authClient } from "@/lib/auth-client";
import { signInSchema, signUpSchema } from "@/lib/validation/auth";

type Mode = "sign-in" | "sign-up";

const MODES = [
  { value: "sign-in", label: "entrar" },
  { value: "sign-up", label: "criar conta" },
] as const;

const inputClasses =
  "w-full rounded-sm border border-line bg-background-2 px-3 py-2 text-sm transition-colors focus:border-accent";

const labelClasses = "font-mono text-xs text-muted";

const socialButtonClasses =
  "flex h-10 items-center justify-center rounded-full border border-line font-mono text-xs text-muted transition-colors hover:border-accent hover:text-accent disabled:opacity-50";

type SocialProviders = { github: boolean; google: boolean };

export function AuthForm({ social }: { social: SocialProviders }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("sign-in");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const hasSocial = social.github || social.google;

  async function handleSocial(provider: "github" | "google") {
    setError(null);
    const { error: authError } = await authClient.signIn.social({
      provider,
      callbackURL: "/",
    });
    if (authError) {
      setError(authError.message ?? "não foi possível autenticar");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const isSignUp = mode === "sign-up";
    const parsed = isSignUp
      ? signUpSchema.safeParse({ name, email, password })
      : signInSchema.safeParse({ email, password });

    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "dados inválidos");
      return;
    }

    setSubmitting(true);
    const { error: authError } = isSignUp
      ? await authClient.signUp.email({ name, email, password })
      : await authClient.signIn.email({ email, password });
    setSubmitting(false);

    if (authError) {
      setError(authError.message ?? "não foi possível autenticar");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div
        role="tablist"
        aria-label="modo de acesso"
        className="flex gap-1 rounded-sm border border-line bg-background-2 p-1"
      >
        {MODES.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={mode === value}
            onClick={() => {
              setMode(value);
              setError(null);
            }}
            className={cn(
              "flex-1 rounded-sm px-3 py-1.5 font-mono text-xs transition-colors",
              mode === value
                ? "bg-accent-soft text-accent"
                : "text-muted hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {hasSocial && (
        <>
          <div className="flex flex-col gap-2">
            {social.github && (
              <button
                type="button"
                onClick={() => handleSocial("github")}
                className={socialButtonClasses}
              >
                continuar com GitHub
              </button>
            )}
            {social.google && (
              <button
                type="button"
                onClick={() => handleSocial("google")}
                className={socialButtonClasses}
              >
                continuar com Google
              </button>
            )}
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-faint">
            <span className="h-px flex-1 bg-line" />
            ou
            <span className="h-px flex-1 bg-line" />
          </div>
        </>
      )}

      {mode === "sign-up" && (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className={labelClasses}>
            nome
          </label>
          <input
            id="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            className={inputClasses}
          />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className={labelClasses}>
          email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          className={inputClasses}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className={labelClasses}>
          senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
          className={inputClasses}
        />
      </div>

      {error && (
        <p role="alert" className="font-mono text-xs text-danger">
          {error}
        </p>
      )}

      <Button
        type="submit"
        variant="solid"
        disabled={submitting}
        className="rounded-full bg-accent-fill font-semibold text-on-accent"
      >
        {submitting
          ? "enviando…"
          : mode === "sign-up"
            ? "criar conta"
            : "entrar"}
      </Button>
    </form>
  );
}
