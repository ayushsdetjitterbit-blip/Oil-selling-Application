import { NextResponse } from "next/server";
import { getOrder, updateOrder } from "@/lib/orders";
import { charge } from "@/lib/payment";
import { paySchema } from "@/lib/validation";

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const order = await getOrder(id);
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  if (order.status !== "awaiting_payment") {
    return NextResponse.json({ error: "This order is already confirmed" }, { status: 409 });
  }
  const parsed = paySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid payment details" }, { status: 400 });
  }
  const p = parsed.data;

  if (p.method === "cod") {
    await updateOrder(id, { status: "confirmed", paymentStatus: "cod_due", paymentMethod: "cod" });
    return NextResponse.json({ ok: true });
  }

  const result = await charge({
    method: p.method,
    amount: order.totals.total,
    cardNumber: p.method === "card" ? p.number : undefined,
  });
  if (!result.ok) {
    await updateOrder(id, { paymentStatus: "failed", paymentMethod: p.method });
    return NextResponse.json({ error: result.message }, { status: 402 });
  }
  await updateOrder(id, { status: "confirmed", paymentStatus: "paid", paymentMethod: p.method, paymentRef: result.ref });
  return NextResponse.json({ ok: true });
}
