import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { RuledPage, RuledSection } from "@gabriel/ui";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "admin",
};

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // notFound instead of redirect: non-admins get no hint this route exists
  if (session?.user.role !== "admin") {
    notFound();
  }

  return (
    <RuledPage className="mx-auto max-w-3xl px-6 pb-16">
      <RuledSection>
        <h1 className="text-3xl font-semibold">admin</h1>
        <p className="mt-3 max-w-prose text-muted">
          Olá, {session.user.name}. O editor de posts chega aqui em breve.
        </p>
      </RuledSection>
    </RuledPage>
  );
}
