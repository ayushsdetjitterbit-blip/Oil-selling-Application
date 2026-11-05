import Link from "next/link";
import { getDashboard, STORE_TZ } from "@/lib/stats";
import { findVariant, inr } from "@/lib/products";
import { RevenueChart } from "@/components/admin/revenue-chart";
import { StatusPill } from "@/components/admin/status-pill";
import { AutoRefresh } from "@/components/auto-refresh";

export const metadata = { title: "Dashboard" };

const compact = (n: number) => (n >= 100_000 ? `₹${(n / 100_000).toFixed(1)}L` : inr(n));

function Tile({ label, value, note, href }: { label: string; value: string; note?: string; href?: string }) {
  const body = (
    <>
      <p className="text-sm text-bark/60">{label}</p>
      <p className="mt-1 font-sans text-3xl font-semibold text-bark">{value}</p>
      {note && <p className="mt-1 text-xs text-bark/55">{note}</p>}
    </>
  );
  const cls = "block rounded-2xl border border-sand bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md";
  return href ? <Link href={href} className={cls}>{body}</Link> : <div className={cls}>{body}</div>;
}

export default async function Dashboard() {
  const d = await getDashboard();
  const t = d.totals;
  const now = new Date().toLocaleString("en-IN", { timeZone: STORE_TZ, weekday: "long", day: "numeric", month: "long", hour: "numeric", minute: "2-digit" });
  const topMax = Math.max(1, ...d.top.map((p) => p.units));
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <AutoRefresh seconds={30} />
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-3xl font-bold text-leaf-dark">Dashboard</h1>
          <p className="text-sm text-bark/60">{now}</p>
        </div>
        <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-bark/70 shadow-sm">
          <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-60" /><span className="relative h-2 w-2 rounded-full bg-leaf" /></span>
          Live · refreshes every 30 seconds
        </p>
      </div>

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr_1fr]">
        <div className="hero-bg grain relative overflow-hidden rounded-2xl p-6 text-cream lg:row-span-2">
          <p className="relative text-sm text-cream/75">Revenue, last 7 days</p>
          <p className="relative mt-2 font-sans text-6xl font-semibold">{compact(t.week)}</p>
          <p className="relative mt-3 text-sm text-cream/75">Today {inr(t.today)} from {t.today_orders} order{t.today_orders === 1 ? "" : "s"}</p>
          <p className="relative mt-1 text-sm text-cream/75">All time {inr(t.all_time)} · {t.orders} confirmed order{t.orders === 1 ? "" : "s"}</p>
        </div>
        <Tile label="To pack & ship" value={String(t.to_ship)} note="Confirmed or packed orders" href="/admin/orders?status=confirmed" />
        <Tile label="Average order" value={inr(t.avg)} note="Confirmed orders" />
        <Tile label="Awaiting payment" value={String(t.awaiting)} note="Checkout started, not paid" href="/admin/orders?status=awaiting_payment" />
        <Tile label="Rating" value={d.reviews.avg != null ? `${d.reviews.avg} ★` : "–"} note={`${d.reviews.count} verified review${d.reviews.count === 1 ? "" : "s"} · ${d.subscribers} subscriber${d.subscribers === 1 ? "" : "s"}`} href="/admin/reviews" />
      </section>

      <section className="rounded-2xl border border-sand bg-white p-5">
        <h2 className="font-serif text-lg font-bold">Revenue per day</h2>
        <p className="mb-3 text-xs text-bark/55">Last 14 days, confirmed orders, Indian time. Hover or tab to a day for details.</p>
        <RevenueChart days={d.daily} />
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-sand bg-white p-5">
          <h2 className="font-serif text-lg font-bold">Best sellers</h2>
          <p className="mb-4 text-xs text-bark/55">Bottles sold, last 30 days</p>
          {d.top.length === 0 ? <p className="py-6 text-center text-sm text-bark/55">No sales yet</p> : (
            <ul className="space-y-3">
              {d.top.map((p) => (
                <li key={p.product_slug} title={`${p.name}: ${p.units} sold, ${inr(p.revenue)}`}>
                  <div className="flex justify-between text-sm"><span className="font-semibold">{p.name}</span><span className="text-bark/60">{inr(p.revenue)}</span></div>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="h-3 flex-1"><span className="grow-x block h-full rounded-r-[4px] bg-chart-green" style={{ width: `${(p.units / topMax) * 100}%` }} /></span>
                    <span className="w-10 text-right text-sm font-semibold tabular-nums">{p.units}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-sand bg-white p-5">
          <div className="flex items-center justify-between"><h2 className="font-serif text-lg font-bold">Low stock</h2><Link href="/admin/products" className="text-xs font-semibold text-leaf underline">Update stock →</Link></div>
          <p className="mb-4 text-xs text-bark/55">Sizes with 10 or fewer left</p>
          {d.low.length === 0 ? <p className="py-6 text-center text-sm text-bark/55">✓ Everything is well stocked</p> : (
            <ul className="divide-y divide-sand">
              {d.low.map((v) => {
                const f = findVariant(v.id);
                return (
                  <li key={v.id} className="flex items-center justify-between py-2 text-sm">
                    <span>{f ? `${f.product.name} · ${f.size.label}` : v.id}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold ${v.stock === 0 ? "bg-red-50 text-red-800" : "bg-amber-50 text-amber-900"}`}>{v.stock === 0 ? "Sold out" : `${v.stock} left`}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      <section className="rounded-2xl border border-sand bg-white p-5">
        <div className="mb-3 flex items-center justify-between"><h2 className="font-serif text-lg font-bold">Latest orders</h2><Link href="/admin/orders" className="text-xs font-semibold text-leaf underline">All orders →</Link></div>
        {d.recent.length === 0 ? <p className="py-6 text-center text-sm text-bark/55">No orders yet. They will appear here the moment a customer checks out.</p> : (
          <ul className="divide-y divide-sand">
            {d.recent.map((o) => (
              <li key={o.id}>
                <Link href={`/admin/orders/${o.id}`} className="flex flex-wrap items-center gap-x-4 gap-y-1 py-3 hover:bg-cream/60">
                  <span className="w-32 font-mono text-xs font-semibold">{o.id}</span>
                  <span className="min-w-0 flex-1 text-sm">{o.name} <span className="text-bark/55">· {o.city}</span></span>
                  <StatusPill status={o.status} />
                  <span className="w-20 text-right text-sm font-semibold tabular-nums">{inr(o.total)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
