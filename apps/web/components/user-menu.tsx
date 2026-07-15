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
        className="font-mono text-xs text-accent transition-colors hover:underline"
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
          admin
        </Link>
      )}
      <span className="text-muted">{firstName}</span>
      <button
        type="button"
        onClick={handleSignOut}
        className="text-muted transition-colors hover:text-accent"
      >
        sair
      </button>
    </span>
  );
}
