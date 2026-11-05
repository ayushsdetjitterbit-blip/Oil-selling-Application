import { notFound, redirect } from "next/navigation";
import { getOrder } from "@/lib/orders";
import { OrderSummary } from "@/components/order-summary";
import { PaymentForm } from "@/components/payment-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment" };

export default async function PaymentPage({ params }: { params: Promise<{ id: string }> }) {
  const order = await getOrder((await params).id);
  if (!order) notFound();
  if (order.status !== "awaiting_payment") redirect(`/order/${order.id}`);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-leaf-dark">Payment</h1>
      <p className="mt-1 text-sm text-bark/60">Step 2 of 2 · Order {order.id}</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <PaymentForm orderId={order.id} total={order.totals.total} />
        <aside className="space-y-4">
          <OrderSummary t={order.totals} />
          <div className="rounded-2xl border border-sand bg-white p-4 text-sm">
            <p className="font-semibold">Deliver to</p>
            <p className="mt-1 text-bark/70">{order.customer.name}, {order.customer.address}, {order.customer.city}, {order.customer.state} {order.customer.pincode}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
