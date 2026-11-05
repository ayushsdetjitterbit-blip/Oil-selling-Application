import Link from "next/link";
import { listOrders, NEXT_STATUS, STATUS_LABEL, statusCounts, type OrderStatus } from "@/lib/orders";
import { inr } from "@/lib/products";
import { setOrderStatus } from "@/app/admin/actions";
import { PaymentText, StatusPill } from "@/components/admin/status-pill";
import { AutoRefresh } from "@/components/auto-refresh";

export const metadata = { title: "Orders" };

const FILTERS: (OrderStatus | "all")[] = ["all", "confirmed", "packed", "shipped", "delivered", "awaiting_payment", "cancelled"];
const ACTION: Partial<Record<OrderStatus, string>> = { packed: "Mark packed", shipped: "Mark shipped", delivered: "Mark delivered" };
const time = (d: Date) => d.toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default async function Orders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; done?: string; error?: string; order?: string }> }) {
  const sp = await searchParams;
  const status = FILTERS.includes(sp.status as OrderStatus) && sp.status !== "all" ? (sp.status as OrderStatus) : null;
  const [orders, counts] = await Promise.all([listOrders({ status, q: sp.q }), statusCounts()]);
  const total = Object.values(counts).reduce((s, n) => s + (n ?? 0), 0);
  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <AutoRefresh seconds={30} />
      <h1 className="font-serif text-3xl font-bold text-leaf-dark">Orders</h1>
      {sp.done && <p className="rise rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">✓ {sp.order} marked {STATUS_LABEL[sp.done as OrderStatus]?.toLowerCase() ?? sp.done}.</p>}
      {sp.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{sp.error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        {FILTERS.map((f) => {
          const n = f === "all" ? total : counts[f] ?? 0;
          const on = (f === "all" && !status) || f === status;
          const qs = new URLSearchParams({ ...(f !== "all" && { status: f }), ...(sp.q && { q: sp.q }) }).toString();
          return (
            <Link key={f} href={`/admin/orders${qs ? `?${qs}` : ""}`}
              className={`rounded-full border px-3 py-1.5 text-sm font-semibold transition ${on ? "border-leaf bg-leaf text-white" : "border-sand bg-white hover:border-leaf/40"}`}>
              {f === "all" ? "All" : STATUS_LABEL[f]} <span className={on ? "text-white/75" : "text-bark/50"}>{n}</span>
            </Link>
          );
        })}
        <form className="ml-auto flex gap-2" action="/admin/orders">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={sp.q} placeholder="Search ID, name, phone, city" aria-label="Search orders" className="field !w-64 !py-2 text-sm" />
          <button className="btn btn-ghost !px-4 !py-2 text-sm">Search</button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-sand bg-white">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-cream/60 text-xs uppercase tracking-wider text-bark/60">
            <tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3 text-right">Total</th><th className="px-4 py-3">Payment</th><th className="px-4 py-3">Status</th><th className="px-4 py-3" /></tr>
          </thead>
          <tbody className="divide-y divide-sand">
            {orders.length === 0 && <tr><td colSpan={6} className="px-4 py-12 text-center text-bark/55">No orders here yet.</td></tr>}
            {orders.map((o) => {
              const next = NEXT_STATUS[o.status];
              return (
                <tr key={o.id} className={`hover:bg-cream/50 ${sp.order === o.id ? "bg-gold/10" : ""}`}>
                  <td className="px-4 py-3"><Link href={`/admin/orders/${o.id}`} className="font-mono text-xs font-bold text-leaf underline">{o.id}</Link><p className="text-xs text-bark/55">{time(o.created_at)}</p></td>
                  <td className="px-4 py-3"><p className="font-semibold">{o.name}</p><p className="text-xs text-bark/55">{o.city} · {o.units} item{o.units === 1 ? "" : "s"}</p></td>
                  <td className="px-4 py-3 text-right font-semibold tabular-nums">{inr(o.total)}</td>
                  <td className="px-4 py-3"><PaymentText status={o.payment_status} method={o.payment_method} /></td>
                  <td className="px-4 py-3"><StatusPill status={o.status} /></td>
                  <td className="px-4 py-3 text-right">
                    {next && (
                      <form action={setOrderStatus}>
                        <input type="hidden" name="id" value={o.id} /><input type="hidden" name="to" value={next} /><input type="hidden" name="back" value="list" />
                        <button className="whitespace-nowrap rounded-full bg-leaf px-3 py-1.5 text-xs font-semibold text-white hover:bg-leaf-dark">{ACTION[next]}</button>
                      </form>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
