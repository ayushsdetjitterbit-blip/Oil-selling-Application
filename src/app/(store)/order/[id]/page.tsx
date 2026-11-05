import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder, PAYMENT_LABEL } from "@/lib/orders";
import { reviewedSlugs } from "@/lib/reviews";
import { inr } from "@/lib/products";
import { OrderSummary } from "@/components/order-summary";
import { ClearCart } from "@/components/clear-cart";
import { StatusSteps } from "@/components/status-steps";
import { OrderTimeline } from "@/components/order-timeline";
import { AutoRefresh } from "@/components/auto-refresh";
import { ReviewForm } from "@/components/review-form";

export const metadata = { title: "Your order" };

const HEADLINE = {
  awaiting_payment: "Order not paid yet",
  confirmed: "Thank you, your order is confirmed!",
  packed: "Your oil is packed and ready",
  shipped: "Your order is on its way",
  delivered: "Delivered! Enjoy your oil 🌿",
  cancelled: "This order was cancelled",
} as const;

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> }) {
  const { id } = await params;
  const { placed } = await searchParams;
  if (!/^NO-[0-9A-F]{10}$/.test(id)) notFound();
  const order = await getOrder(id);
  if (!order) notFound();
  const confirmed = order.status !== "awaiting_payment" && order.status !== "cancelled";
  const moving = ["confirmed", "packed", "shipped"].includes(order.status);
  const delivered = order.status === "delivered";
  const reviewed = delivered ? await reviewedSlugs(order.id) : new Set<string>();
  const products = [...new Map(order.totals.lines.map((l) => [l.slug, l.name])).entries()];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {confirmed && placed && <ClearCart />}
      {moving && <AutoRefresh seconds={20} />}
      <div className="hero-bg grain relative overflow-hidden rounded-3xl p-8 text-white">
        {confirmed && placed && (
          <div aria-hidden className="pointer-events-none absolute inset-0">
            {Array.from({ length: 18 }).map((_, i) => (
              <span key={i} className="confetti absolute top-0 h-2.5 w-1.5 rounded-sm" style={{ left: `${(i * 53) % 100}%`, background: ["#e0a81c", "#f4ecd6", "#b4532a"][i % 3], animationDelay: `${(i % 6) * 0.15}s` }} />
            ))}
          </div>
        )}
        {confirmed && <span className="check-pop relative mb-4 grid h-14 w-14 place-items-center rounded-full bg-gold text-2xl font-bold text-leaf-dark">✓</span>}
        <h1 className="relative font-serif text-3xl font-bold md:text-4xl">{HEADLINE[order.status]}</h1>
        <p className="relative mt-2 text-white/85">Order ID <b>{order.id}</b>. Save it with your phone number to track the order.</p>
        {moving && <p className="relative mt-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs"><span className="h-2 w-2 animate-pulse rounded-full bg-gold" /> This page updates by itself as your order moves</p>}
      </div>

      {order.status === "awaiting_payment" ? (
        <Link href={`/payment/${order.id}`} className="btn btn-primary mt-6">Complete payment</Link>
      ) : (
        <div className="mt-6 rounded-2xl border border-sand bg-white p-6"><StatusSteps status={order.status} /></div>
      )}

      {delivered && (
        <section className="mt-6 rounded-2xl border-2 border-gold/60 bg-gradient-to-br from-[#fff7df] to-paper p-6">
          <h2 className="font-serif text-2xl font-bold">How was your oil?</h2>
          <p className="mt-1 text-sm text-bark/70">Your review shows on the shop with a verified-buyer badge, under your first name and city.</p>
          <div className="mt-5 space-y-6">
            {products.map(([slug, name]) => (
              <div key={slug}>
                <p className="mb-2 font-semibold">{name}</p>
                {reviewed.has(slug) ? (
                  <p className="rise rounded-xl bg-leaf/10 p-3 text-sm font-semibold text-leaf">
                    ✓ Thank you! Your review is live on the shop. <Link href={`/shop/${slug}#reviews`} className="underline">See it</Link>
                  </p>
                ) : <ReviewForm orderId={order.id} slug={slug} name={name} />}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <OrderSummary t={order.totals} />
          <div className="rounded-2xl border border-sand bg-white p-5">
            <p className="mb-4 font-serif text-lg font-bold">Order history</p>
            <OrderTimeline events={order.events} />
          </div>
        </div>
        <div className="space-y-4">
          <div className="rounded-2xl border border-sand bg-white p-5 text-sm">
            <p className="font-serif text-lg font-bold">Delivery address</p>
            <p className="mt-2">{order.customer.name}<br />{order.customer.address}<br />{order.customer.city}, {order.customer.state} {order.customer.pincode}<br />📞 {order.customer.phone}</p>
          </div>
          <div className="rounded-2xl border border-sand bg-white p-5 text-sm">
            <p className="font-serif text-lg font-bold">Payment</p>
            <p className="mt-2">{PAYMENT_LABEL[order.paymentStatus]} · {inr(order.totals.total)}</p>
            {order.paymentRef && <p className="text-xs text-bark/60">Ref {order.paymentRef}</p>}
          </div>
        </div>
      </div>
      <Link href="/shop" className="btn btn-ghost mt-8">Continue shopping</Link>
    </div>
  );
}
