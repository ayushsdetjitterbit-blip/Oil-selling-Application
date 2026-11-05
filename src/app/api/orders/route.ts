import { NextResponse } from "next/server";
import { computeTotals } from "@/lib/pricing";
import { createOrder } from "@/lib/orders";
import { createOrderSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid order" }, { status: 400 });
  }
  // Prices are always recomputed on the server; the client's totals are never trusted.
  const totals = computeTotals(parsed.data.items, parsed.data.coupon);
  if (totals.lines.length === 0) return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
  const order = await createOrder(parsed.data.customer, totals);
  return NextResponse.json({ id: order.id }, { status: 201 });
}
