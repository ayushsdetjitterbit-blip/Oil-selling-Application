import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = (url.searchParams.get("id") ?? "").trim().toUpperCase();
  const phone = (url.searchParams.get("phone") ?? "").replace(/\D/g, "").slice(-10);
  const order = id ? await getOrder(id) : null;
  // Same message for "no such order" and "wrong phone" so ids can't be probed.
  if (!order || order.customer.phone !== phone) {
    return NextResponse.json({ error: "No order found for that order ID and phone number" }, { status: 404 });
  }
  return NextResponse.json({
    id: order.id,
    status: order.status,
    paymentStatus: order.paymentStatus,
    createdAt: order.createdAt,
    total: order.totals.total,
    items: order.totals.lines.map((l) => `${l.name} (${l.sizeLabel}) × ${l.qty}`),
  });
}
