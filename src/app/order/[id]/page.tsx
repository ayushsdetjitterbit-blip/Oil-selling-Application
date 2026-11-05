import Link from "next/link";
import { notFound } from "next/navigation";
import { getOrder } from "@/lib/orders";
import { OrderSummary } from "@/components/order-summary";
import { ClearCart } from "@/components/clear-cart";
import { StatusSteps } from "@/components/status-steps";
import { inr } from "@/lib/products";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order confirmed" };

const PAY_LABEL = { paid: "Paid online", cod_due: "Pay on delivery", pending: "Payment pending", failed: "Payment failed" } as const;

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ placed?: string }> }) {
  const order = await getOrder((await params).id);
  const { placed } = await searchParams;
  if (!order) notFound();
  const confirmed = order.status !== "awaiting_payment";
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {confirmed && placed && <ClearCart />}
      <div className="rounded-2xl bg-leaf p-6 text-white">
        <h1 className="font-serif text-3xl font-bold">{confirmed ? "Thank you, your order is confirmed!" : "Order not paid yet"}</h1>
        <p className="mt-1 text-white/85">Order ID <b>{order.id}</b>. Save it with your phone number to track the order.</p>
      </div>
      {confirmed ? (
        <div className="mt-6 rounded-2xl border border-sand bg-white p-6"><StatusSteps status={order.status} /></div>
      ) : (
        <Link href={`/payment/${order.id}`} className="btn btn-primary mt-6">Complete payment</Link>
      )}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <OrderSummary t={order.totals} />
        <div className="space-y-4">
          <div className="rounded-2xl border border-sand bg-white p-5 text-sm">
            <p className="font-serif text-lg font-bold">Delivery address</p>
            <p className="mt-2">{order.customer.name}<br />{order.customer.address}<br />{order.customer.city}, {order.customer.state} {order.customer.pincode}<br />📞 {order.customer.phone}</p>
          </div>
          <div className="rounded-2xl border border-sand bg-white p-5 text-sm">
            <p className="font-serif text-lg font-bold">Payment</p>
            <p className="mt-2">{PAY_LABEL[order.paymentStatus]} · {inr(order.totals.total)}</p>
            {order.paymentRef && <p className="text-xs text-bark/60">Ref {order.paymentRef}</p>}
          </div>
        </div>
      </div>
      <Link href="/shop" className="btn btn-ghost mt-8">Continue shopping</Link>
    </div>
  );
}
