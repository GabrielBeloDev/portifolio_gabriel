import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  DailyViewsAreaChart,
  PostViewsBarChart,
  SignupsAreaChart,
} from "@/components/admin/metrics-charts";
import {
  getAdminTotals,
  listSignupsByDay,
  listUsersWithLastSession,
  listViewsByDay,
  listViewsByPost,
} from "@/lib/admin-metrics";
import { UsersTable } from "@/components/admin/users-table";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "dashboard",
};

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await auth.api.getSession({ headers: await headers() });

  // notFound instead of redirect: non-admins get no hint this route exists
  if (session?.user.role !== "admin") {
    notFound();
  }

  const [users, signupsByDay, viewsByDay, viewsByPost, totals] =
    await Promise.all([
      listUsersWithLastSession(),
      listSignupsByDay(),
      listViewsByDay(),
      listViewsByPost(),
      getAdminTotals(),
    ]);

  const totalCards = [
    { label: "comentários", value: totals.comments },
    { label: "likes", value: totals.likes },
    { label: "reportados pendentes", value: totals.reportedPending },
  ];

  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-14 pb-16">
      <p className="font-mono text-sm tracking-wide text-faint"># dashboard</p>
      <h1 className="mt-2 text-3xl font-semibold">dashboard</h1>

      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {totalCards.map((card) => (
          <div
            key={card.label}
            className="rounded-md border border-line bg-surface px-4 py-3"
          >
            <p className="font-mono text-xs text-faint">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold">{card.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-8 overflow-hidden rounded-md border border-line bg-surface">
        <p className="flex items-center gap-1.5 border-b border-line bg-background-2 px-4 py-2 font-mono text-xs text-faint">
          <span aria-hidden>⌄</span>
          pessoas/
        </p>
        <UsersTable
          users={users.map((person) => ({
            id: person.id,
            name: person.name,
            email: person.email,
            role: person.role,
            createdAt: person.createdAt.toISOString(),
            lastSeenAt: person.lastSeenAt
              ? person.lastSeenAt.toISOString()
              : null,
          }))}
        />
      </section>

      <section className="mt-8 overflow-hidden rounded-md border border-line bg-surface">
        <p className="flex items-center gap-1.5 border-b border-line bg-background-2 px-4 py-2 font-mono text-xs text-faint">
          <span aria-hidden>⌄</span>
          cadastros por dia (30d)/
        </p>
        <SignupsAreaChart data={signupsByDay} />
      </section>

      <section className="mt-8 overflow-hidden rounded-md border border-line bg-surface">
        <p className="flex items-center gap-1.5 border-b border-line bg-background-2 px-4 py-2 font-mono text-xs text-faint">
          <span aria-hidden>⌄</span>
          views por dia (30d)/
        </p>
        <DailyViewsAreaChart data={viewsByDay} />
      </section>

      <section className="mt-8 overflow-hidden rounded-md border border-line bg-surface">
        <p className="flex items-center gap-1.5 border-b border-line bg-background-2 px-4 py-2 font-mono text-xs text-faint">
          <span aria-hidden>⌄</span>
          views por post/
        </p>
        <PostViewsBarChart data={viewsByPost} />
      </section>
    </div>
  );
}
