"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { formatDateHuman } from "@/lib/format";

// Local shapes on purpose: importing lib/admin-metrics here would pull the
// server-only db client into the client bundle
type SignupPoint = { day: string; total: number };
type PostViewsPoint = { slug: string; title: string; views: number };

const AXIS_TICK = { fill: "var(--muted-2)", fontSize: 11 };
const AXIS_LINE = { stroke: "var(--line)" };
const GRID_STROKE = "var(--line)";

const MAX_CATEGORY_TICK_CHARS = 22;

const formatDayTick = (day: string): string =>
  `${day.slice(8, 10)}/${day.slice(5, 7)}`;

const formatCategoryTick = (title: string): string =>
  title.length > MAX_CATEGORY_TICK_CHARS
    ? `${title.slice(0, MAX_CATEGORY_TICK_CHARS - 1)}…`
    : title;

type ChartTooltipProps = Partial<
  Pick<TooltipContentProps<number, string>, "active" | "label" | "payload">
> & {
  unit: string;
  formatLabel?: (label: string) => string;
};

function ChartTooltip({
  active,
  label,
  payload,
  unit,
  formatLabel,
}: ChartTooltipProps) {
  const value = payload?.[0]?.value;
  if (!active || value === undefined) return null;

  const heading = String(label ?? "");
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 font-mono text-xs">
      <p className="text-faint">
        {formatLabel ? formatLabel(heading) : heading}
      </p>
      <p className="mt-1 text-muted">
        {value} {unit}
      </p>
    </div>
  );
}

export function SignupsAreaChart({ data }: { data: SignupPoint[] }) {
  return (
    <div
      role="img"
      aria-label="Gráfico de área com o número de cadastros por dia nos últimos 30 dias"
      className="px-2 py-3 font-mono"
    >
      <ResponsiveContainer width="100%" height={240}>
        <AreaChart
          data={data}
          margin={{ top: 8, right: 12, bottom: 0, left: 0 }}
        >
          <CartesianGrid stroke={GRID_STROKE} vertical={false} />
          <XAxis
            dataKey="day"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={AXIS_LINE}
            tickFormatter={formatDayTick}
            minTickGap={24}
          />
          <YAxis
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={32}
          />
          <Tooltip
            cursor={{ stroke: "var(--muted-2)", strokeDasharray: "3 3" }}
            content={
              <ChartTooltip unit="cadastros" formatLabel={formatDateHuman} />
            }
          />
          <Area
            type="monotone"
            dataKey="total"
            name="cadastros"
            stroke="var(--accent)"
            strokeWidth={2}
            fill="var(--accent)"
            fillOpacity={0.12}
            activeDot={{
              r: 4,
              fill: "var(--accent)",
              stroke: "var(--surface)",
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PostViewsBarChart({ data }: { data: PostViewsPoint[] }) {
  if (data.length === 0) {
    return (
      <p className="px-4 py-6 font-mono text-sm text-faint">
        {"// nenhuma view registrada ainda"}
      </p>
    );
  }

  const chartHeight = Math.max(140, data.length * 44);

  return (
    <div
      role="img"
      aria-label="Gráfico de barras horizontais com o total de views por post"
      className="px-2 py-3 font-mono"
    >
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 8, right: 32, bottom: 0, left: 8 }}
        >
          <CartesianGrid stroke={GRID_STROKE} horizontal={false} />
          <XAxis
            type="number"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={AXIS_LINE}
            allowDecimals={false}
          />
          <YAxis
            type="category"
            dataKey="title"
            tick={AXIS_TICK}
            tickLine={false}
            axisLine={false}
            tickFormatter={formatCategoryTick}
            width={150}
          />
          <Tooltip
            cursor={{ fill: "var(--line)", fillOpacity: 0.4 }}
            content={<ChartTooltip unit="views" />}
          />
          <Bar
            dataKey="views"
            name="views"
            fill="var(--ok)"
            radius={[0, 4, 4, 0]}
            barSize={14}
            label={{ position: "right", fill: "var(--muted-2)", fontSize: 11 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
