import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder, NEXT_STATUS, STATUS_LABEL, type OrderStatus } from "@/lib/orders";
import { inr } from "@/lib/products";
import { setOrderStatus } from "@/app/admin/actions";
import { PaymentText, StatusPill } from "@/components/admin/status-pill";
import { ConfirmButton } from "@/components/admin/confirm-button";
import { OrderTimeline, when } from "@/components/order-timeline";
import { StatusSteps } from "@/components/status-steps";
import { ChatIcon, HomeIcon, MailIcon, PackageIcon, PhoneIcon, TruckIcon } from "@/components/icons";

export const metadata = { title: "Order" };

const ACTION: Partial<Record<OrderStatus, [React.ReactNode, string]>> = {
  packed: [<><PackageIcon className="h-4 w-4" /> Mark as packed</>, "Packed the bottles? The customer sees it right away."],
  shipped: [<><TruckIcon className="h-4 w-4" /> Mark as shipped</>, "Handed to the courier."],
  delivered: [<><HomeIcon className="h-4 w-4" /> Mark as delivered</>, "The customer can now review their oils. Cash on delivery is marked as collected."],
};

export default async function AdminOrder({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ done?: string; error?: string }> }) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^NO-[0-9A-F]{10}$/.test(id)) notFound();
  const o = await getOrder(id);
  if (!o) notFound();
  const next = NEXT_STATUS[o.status];
  const canCancel = !["delivered", "cancelled"].includes(o.status);
  const c = o.customer;
  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link href="/admin/orders" className="text-sm text-bark/60 underline">← All orders</Link>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-mono text-2xl font-bold text-leaf-dark">{o.id}</h1>
        <StatusPill status={o.status} />
        <span className="text-sm text-bark/55">Placed {when(o.createdAt)}</span>
      </div>
      {sp.done && <p className="rise rounded-xl bg-emerald-50 p-3 text-sm font-semibold text-emerald-900">✓ Marked {STATUS_LABEL[sp.done as OrderStatus]?.toLowerCase() ?? sp.done}. The customer&apos;s order page updates by itself.</p>}
      {sp.error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{sp.error}</p>}

      <section className="rounded-2xl border border-sand bg-white p-5">
        {o.status === "awaiting_payment" ? <p className="text-sm text-bark/70">The customer hasn&apos;t paid yet. Nothing to ship.</p> : <StatusSteps status={o.status} />}
        {(next || canCancel) && (
          <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-sand pt-4">
            {next && ACTION[next] && (
              <form action={setOrderStatus} className="flex flex-wrap items-center gap-3">
                <input type="hidden" name="id" value={o.id} /><input type="hidden" name="to" value={next} />
                <button className="btn btn-primary">{ACTION[next][0]}</button>
                <span className="text-xs text-bark/55">{ACTION[next][1]}</span>
              </form>
            )}
            {canCancel && (
              <form action={setOrderStatus} className="ml-auto">
                <input type="hidden" name="id" value={o.id} /><input type="hidden" name="to" value="cancelled" />
                <ConfirmButton message={`Cancel order ${o.id}? Stock goes back on the shelf${o.paymentStatus === "paid" ? " and the payment is marked refunded" : ""}.`} className="rounded-full border border-red-300 px-4 py-2 text-sm font-semibold text-red-800 hover:bg-red-50">
                  Cancel order
                </ConfirmButton>
              </form>
            )}
          </div>
        )}
      </section>

      <div className="grid gap-5 md:grid-cols-[1.4fr_1fr]">
        <section className="rounded-2xl border border-sand bg-white p-5">
          <h2 className="font-serif text-lg font-bold">Items</h2>
          <table className="mt-3 w-full text-sm">
            <tbody className="divide-y divide-sand">
              {o.totals.lines.map((l) => (
                <tr key={l.variantId}><td className="py-2">{l.name} <span className="text-bark/55">· {l.sizeLabel}</span></td><td className="py-2 text-right tabular-nums">{l.qty} × {inr(l.unitPrice)}</td><td className="py-2 text-right font-semibold tabular-nums">{inr(l.total)}</td></tr>
              ))}
            </tbody>
          </table>
          <dl className="mt-3 space-y-1 border-t border-sand pt-3 text-sm">
            <div className="flex justify-between"><dt>Subtotal</dt><dd className="tabular-nums">{inr(o.totals.subtotal)}</dd></div>
            {o.totals.discount > 0 && <div className="flex justify-between text-leaf"><dt>Coupon {o.totals.couponApplied}</dt><dd className="tabular-nums">−{inr(o.totals.discount)}</dd></div>}
            <div className="flex justify-between"><dt>Shipping</dt><dd className="tabular-nums">{o.totals.shipping ? inr(o.totals.shipping) : "Free"}</dd></div>
            <div className="flex justify-between text-base font-bold"><dt>Total</dt><dd className="tabular-nums">{inr(o.totals.total)}</dd></div>
          </dl>
          <p className="mt-3"><PaymentText status={o.paymentStatus} method={o.paymentMethod} />{o.paymentRef && <span className="text-xs text-bark/55"> · Ref {o.paymentRef}</span>}</p>
        </section>
        <section className="space-y-5">
          <div className="rounded-2xl border border-sand bg-white p-5 text-sm">
            <h2 className="font-serif text-lg font-bold">Customer</h2>
            <p className="mt-2 font-semibold">{c.name}</p>
            <p className="text-bark/75">{c.address}<br />{c.city}, {c.state} {c.pincode}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <a href={`tel:+91${c.phone}`} className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold hover:bg-sand"><PhoneIcon className="h-3.5 w-3.5" />{c.phone}</a>
              <a href={`https://wa.me/91${c.phone}?text=${encodeURIComponent(`Hello ${c.name.split(" ")[0]}, this is Natural Oil about your order ${o.id}.`)}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-900 hover:bg-emerald-100"><ChatIcon className="h-3.5 w-3.5" />WhatsApp</a>
              <a href={`mailto:${c.email}?subject=${encodeURIComponent(`Your Natural Oil order ${o.id}`)}`} className="inline-flex items-center gap-1.5 rounded-full bg-cream px-3 py-1.5 text-xs font-semibold hover:bg-sand"><MailIcon className="h-3.5 w-3.5" />{c.email}</a>
            </div>
          </div>
          <div className="rounded-2xl border border-sand bg-white p-5">
            <h2 className="mb-4 font-serif text-lg font-bold">History</h2>
            <OrderTimeline events={o.events} />
          </div>
        </section>
      </div>
    </div>
  );
}
