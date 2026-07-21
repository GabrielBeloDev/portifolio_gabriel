"use client";

import { useVirtualizer } from "@tanstack/react-virtual";
import { useRef } from "react";
import { formatDateHuman } from "@/lib/format";

export interface UsersTableRow {
  id: string;
  name: string;
  email: string;
  role: string | null;
  createdAt: string;
  lastSeenAt: string | null;
}

const ROW_HEIGHT = 41;
const OVERSCAN = 12;

function UserCells({ person }: { person: UsersTableRow }) {
  const roleBadgeClass =
    person.role === "admin"
      ? "border-accent text-accent"
      : "border-line text-muted";
  return (
    <>
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
        {formatDateHuman(person.createdAt)}
      </td>
      <td className="px-4 py-2.5 text-muted">
        {person.lastSeenAt ? formatDateHuman(person.lastSeenAt) : "—"}
      </td>
    </>
  );
}

// Row virtualization via spacer rows (top/bottom padding <tr>s) keeps the
// table/tr/td semantics valid at any size — only the visible window plus
// overscan is ever in the DOM, so the people table stays cheap as it grows.
export function UsersTable({ users }: { users: UsersTableRow[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: users.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: OVERSCAN,
  });

  const virtualRows = virtualizer.getVirtualItems();
  const totalSize = virtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? (virtualRows[0]?.start ?? 0) : 0;
  const paddingBottom =
    virtualRows.length > 0
      ? totalSize - (virtualRows[virtualRows.length - 1]?.end ?? 0)
      : 0;

  return (
    <div ref={parentRef} className="max-h-[70vh] overflow-auto">
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
          {paddingTop > 0 && (
            <tr aria-hidden>
              <td colSpan={5} style={{ height: paddingTop }} />
            </tr>
          )}
          {virtualRows.map((virtualRow) => {
            const person = users[virtualRow.index];
            if (!person) return null;
            return (
              <tr key={person.id}>
                <UserCells person={person} />
              </tr>
            );
          })}
          {paddingBottom > 0 && (
            <tr aria-hidden>
              <td colSpan={5} style={{ height: paddingBottom }} />
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
