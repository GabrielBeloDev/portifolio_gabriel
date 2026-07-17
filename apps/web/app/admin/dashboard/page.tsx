import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  PostViewsBarChart,
  SignupsAreaChart,
} from "@/components/admin/metrics-charts";
import {
  getAdminTotals,
  listSignupsByDay,
  listUsersWithLastSession,
  listViewsByPost,
} from "@/lib/admin-metrics";
import { auth } from "@/lib/auth";
import { formatDateHuman } from "@/lib/format";

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

  const [users, signupsByDay, viewsByPost, totals] = await Promise.all([
    listUsersWithLastSession(),
    listSignupsByDay(),
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
        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs">
            <thead>
              <tr className="border-b border-line text-left text-faint">
                <th className="px-4 py-2 font-normal">nome</th>
                <th className="px-4 py-2 font-normal">email</th>
                <th className="px-4 py-2 font-normal">role</th>
                <th className="px-4 py-2 font-normal">entrou em</th>
                <th className="px-4 py-2 font-normal">visto por último</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {users.map((person) => {
                const isAdmin = person.role === "admin";
                const roleBadgeClass = isAdmin
                  ? "border-accent text-accent"
                  : "border-line text-muted";
                const lastSeenLabel = person.lastSeenAt
                  ? formatDateHuman(person.lastSeenAt.toISOString())
                  : "—";
                return (
                  <tr key={person.id}>
                    <td className="px-4 py-2.5 font-medium">{person.name}</td>
                    <td
                      className="max-w-[180px] truncate px-4 py-2.5 text-muted"
                      title={person.email}
                    >
                      {person.email}
                    </td>
                    <td className="px-4 py-2.5">
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[11px] ${roleBadgeClass}`}
                      >
                        {person.role ?? "user"}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-muted">
                      {formatDateHuman(person.createdAt.toISOString())}
                    </td>
                    <td className="px-4 py-2.5 text-muted">{lastSeenLabel}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
          views por post/
        </p>
        <PostViewsBarChart data={viewsByPost} />
      </section>
    </div>
  );
}
