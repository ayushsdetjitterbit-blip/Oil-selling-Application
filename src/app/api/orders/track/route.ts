import { NextResponse } from "next/server";
import { getOrder } from "@/lib/orders";
import { errorResponse } from "@/lib/api";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = (url.searchParams.get("id") ?? "").trim().toUpperCase();
  const phone = (url.searchParams.get("phone") ?? "").replace(/\D/g, "").slice(-10);
  try {
    const order = /^NO-[0-9A-F]{10}$/.test(id) ? await getOrder(id) : null;
    // Same message for "no such order" and "wrong phone" so order IDs can't be probed.
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
      events: order.events,
    });
  } catch (e) {
    return errorResponse(e);
  }
}
