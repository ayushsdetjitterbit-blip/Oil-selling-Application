"use client";
import { useState } from "react";

type Day = { day: string; revenue: number; orders: number };

const W = 680;
const H = 240;
const PAD = { l: 52, r: 8, t: 18, b: 30 };

function niceStep(max: number) {
  if (max <= 0) return 250;
  const rough = max / 4;
  const pow = 10 ** Math.floor(Math.log10(rough));
  return [1, 2, 2.5, 5, 10].map((m) => m * pow).find((s) => s >= rough) ?? 10 * pow;
}
const rupees = (n: number) => "₹" + n.toLocaleString("en-IN");
const label = (day: string) => new Date(day + "T00:00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short" });

/** Column chart of daily revenue. One series, so no legend: the card title names it. */
export function RevenueChart({ days }: { days: Day[] }) {
  const [active, setActive] = useState<number | null>(null);
  const step = niceStep(Math.max(0, ...days.map((d) => d.revenue)));
  const top = step * 4;
  const compact = top >= 10_000;
  const tick = (v: number) => (v === 0 ? "₹0" : compact ? `₹${+(v / 1000).toFixed(1)}K` : rupees(v));
  const plotH = H - PAD.t - PAD.b;
  const band = (W - PAD.l - PAD.r) / days.length;
  const barW = Math.min(24, band * 0.62);
  const y = (v: number) => PAD.t + plotH - (v / top) * plotH;
  const empty = days.every((d) => d.revenue === 0);
  const a = active == null ? null : days[active];

  return (
    <div className="relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Revenue per day for the last 14 days">
        {[0, 1, 2, 3, 4].map((i) => (
          <g key={i}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(step * i)} y2={y(step * i)} stroke="var(--color-grid)" strokeWidth="1" />
            <text x={PAD.l - 8} y={y(step * i) + 4} textAnchor="end" fontSize="11" fill="#7a6a55" style={{ fontVariantNumeric: "tabular-nums" }}>{tick(step * i)}</text>
          </g>
        ))}
        {days.map((d, i) => {
          const x = PAD.l + i * band + (band - barW) / 2;
          const base = y(0);
          const h = base - y(d.revenue);
          const r = Math.min(4, h);
          const isToday = i === days.length - 1;
          return (
            <g key={d.day}>
              {h > 0 && (
                <path className="grow-y" style={{ animationDelay: `${i * 35}ms` }}
                  d={`M${x} ${base} V${base - h + r} Q${x} ${base - h} ${x + r} ${base - h} H${x + barW - r} Q${x + barW} ${base - h} ${x + barW} ${base - h + r} V${base} Z`}
                  fill="var(--color-chart-green)" opacity={active == null || active === i ? 1 : 0.45} />
              )}
              {(i % 2 === days.length % 2 || isToday) && (
                <text x={x + barW / 2} y={H - 10} textAnchor="middle" fontSize="11" fill={isToday ? "#3b2a17" : "#7a6a55"} fontWeight={isToday ? 700 : 400}>
                  {isToday ? "Today" : label(d.day)}
                </text>
              )}
              <rect x={PAD.l + i * band} y={PAD.t} width={band} height={plotH} fill="transparent" tabIndex={0} role="button"
                aria-label={`${label(d.day)}: ${rupees(d.revenue)} from ${d.orders} order${d.orders === 1 ? "" : "s"}`}
                onPointerEnter={() => setActive(i)} onPointerLeave={() => setActive(null)} onFocus={() => setActive(i)} onBlur={() => setActive(null)}
                className="cursor-pointer outline-none focus-visible:stroke-leaf" />
            </g>
          );
        })}
        <line x1={PAD.l} x2={W - PAD.r} y1={y(0)} y2={y(0)} stroke="#cfc3a6" strokeWidth="1" />
      </svg>
      {empty && <p className="pointer-events-none absolute inset-x-0 top-1/3 text-center text-sm text-bark/55">No sales in the last 14 days yet</p>}
      {a && (
        <div className="pointer-events-none absolute top-0 z-10 -translate-x-1/2 rounded-xl border border-sand bg-white px-3 py-2 text-center shadow-lg"
          style={{ left: `${((PAD.l + active! * band + band / 2) / W) * 100}%` }}>
          <p className="font-sans text-base font-bold">{rupees(a.revenue)}</p>
          <p className="whitespace-nowrap text-xs text-bark/60">{label(a.day)} · {a.orders} order{a.orders === 1 ? "" : "s"}</p>
        </div>
      )}
      <details className="mt-2 text-sm">
        <summary className="cursor-pointer text-xs font-semibold text-bark/60">Show as table</summary>
        <table className="mt-2 w-full text-left text-xs">
          <thead><tr className="text-bark/60"><th className="py-1 font-semibold">Day</th><th className="font-semibold">Orders</th><th className="text-right font-semibold">Revenue</th></tr></thead>
          <tbody className="tabular-nums">
            {days.map((d) => <tr key={d.day} className="border-t border-sand"><td className="py-1">{label(d.day)}</td><td>{d.orders}</td><td className="text-right">{rupees(d.revenue)}</td></tr>)}
          </tbody>
        </table>
      </details>
    </div>
  );
}
