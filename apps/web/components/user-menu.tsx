"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export function UserMenu() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return <span aria-hidden className="w-12" />;
  }

  if (!session) {
    return (
      <Link
        href="/entrar"
        className="rounded-full border border-line px-2.5 py-0.5 font-mono text-xs text-accent transition-colors hover:border-accent"
      >
        entrar
      </Link>
    );
  }

  const firstName = session.user.name.split(" ")[0] ?? session.user.name;
  const isAdmin = session.user.role === "admin";

  async function handleSignOut() {
    await authClient.signOut();
    router.refresh();
  }

  return (
    <span className="flex items-center gap-3 font-mono text-xs">
      {isAdmin && (
        <Link
          href="/admin"
          className="text-accent transition-colors hover:underline"
        >
          <span aria-hidden>⚙</span> admin
        </Link>
      )}
      <span className="flex items-center gap-1.5 text-muted-2">
        <span aria-hidden className="size-1.5 rounded-full bg-ok" />
        {firstName}
      </span>
      <button
        type="button"
        onClick={handleSignOut}
        className="text-muted-2 transition-colors hover:text-danger"
      >
        sair
      </button>
    </span>
  );
}
