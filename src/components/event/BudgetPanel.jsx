import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Info } from "lucide-react";
import { formatINR } from "@/lib/format";

const COLORS = ["#C6A15B", "#D9A5A0", "#6E4A63", "#7C8F7E", "#A97C50", "#B98EA0", "#8C7A63", "#54706B", "#CA8F7C", "#9A8250"];

export default function BudgetPanel({ event }) {
  const rows = event?.plan?.budget || [];
  const total = rows.reduce((acc, r) => acc + (Number(r.amount) || 0), 0);

  if (!rows.length) {
    return (
      <div className="card-soft p-6">
        <h3 className="text-[19px] text-primary">Budget breakdown</h3>
        <p className="mt-2 text-[13px] text-muted-foreground">Your budget breakdown appears once the plan is generated.</p>
      </div>
    );
  }

  return (
    <div className="card-soft overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border/60 p-5">
        <div>
          <h3 className="text-[19px] text-primary">Budget breakdown</h3>
          <p className="mt-1 text-[12px] text-muted-foreground">
            {formatINR(event.budget)} across {rows.length} categories
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1.5 text-[10.5px] uppercase tracking-[0.14em] text-muted-foreground">
          <Info className="h-3 w-3" /> Estimates only
        </span>
      </div>

      <div className="grid gap-4 p-5 sm:grid-cols-[180px_1fr] sm:items-center">
        <div className="relative h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={rows}
                dataKey="amount"
                nameKey="category"
                innerRadius={54}
                outerRadius={82}
                paddingAngle={2}
                stroke="none"
              >
                {rows.map((row, i) => (
                  <Cell key={row.category} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value, name) => [formatINR(value), name]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid hsl(36 24% 87%)",
                  fontSize: 12,
                  fontFamily: "Jost, sans-serif",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Total</span>
            <span className="serif-display text-[17px] text-primary">{formatINR(total)}</span>
          </div>
        </div>

        <ul className="space-y-3">
          {rows.map((row, i) => (
            <li key={`${row.category}-${i}`}>
              <div className="flex items-baseline justify-between gap-3 text-[13px]">
                <span className="flex items-center gap-2 text-primary">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  {row.category}
                </span>
                <span className="shrink-0 tabular-nums text-muted-foreground">
                  {formatINR(row.amount)} · {row.percent}%
                </span>
              </div>
              <div className="mt-1.5 h-[3px] overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(100, row.percent)}%`, background: COLORS[i % COLORS.length] }}
                />
              </div>
              {row.note && <p className="mt-1 text-[11.5px] leading-snug text-muted-foreground">{row.note}</p>}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}