import { NextResponse } from "next/server";
import { computeTotals, stockProblems } from "@/lib/pricing";
import { createOrder } from "@/lib/orders";
import { getCatalog } from "@/lib/catalog";
import { dbConfigured, DbNotConfiguredError } from "@/lib/db";
import { errorResponse } from "@/lib/api";
import { createOrderSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const parsed = createOrderSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid order" }, { status: 400 });
  }
  try {
    if (!dbConfigured()) throw new DbNotConfiguredError();
    const { products, live } = await getCatalog();
    if (!live) throw new Error("catalog not live");
    // Prices come from the database; whatever the browser sent is never trusted.
    const totals = computeTotals(parsed.data.items, parsed.data.coupon, products);
    if (totals.lines.length === 0) return NextResponse.json({ error: "Your cart is empty" }, { status: 400 });
    const short = stockProblems(parsed.data.items, products);
    if (short.length) {
      const s = short[0];
      const msg = s.available === 0 ? `${s.label} is sold out` : `Only ${s.available} left of ${s.label}`;
      return NextResponse.json({ error: `${msg}. Please update your cart.` }, { status: 409 });
    }
    const order = await createOrder(parsed.data.customer, totals);
    return NextResponse.json({ id: order.id }, { status: 201 });
  } catch (e) {
    return errorResponse(e);
  }
}
