import "server-only";
import { randomBytes } from "node:crypto";
import type { PoolClient } from "pg";
import type { Totals } from "./pricing";
import type { CustomerInput, PayInput } from "./validation";
import { query, transaction } from "./db";
import { cached, invalidate } from "./cache";
import { charge } from "./payment";

export type PaymentMethod = "upi" | "card" | "cod";
export type OrderStatus = "awaiting_payment" | "confirmed" | "packed" | "shipped" | "delivered" | "cancelled";
export type PaymentStatus = "pending" | "paid" | "cod_due" | "failed" | "refunded" | "void";
export type OrderEvent = { status: string; note: string | null; at: string };

export type Order = {
  id: string;
  createdAt: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod | null;
  paymentRef: string | null;
  customer: CustomerInput;
  totals: Totals;
  events: OrderEvent[];
};

export const STATUS_LABEL: Record<OrderStatus, string> = {
  awaiting_payment: "Awaiting payment",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};
export const PAYMENT_LABEL: Record<PaymentStatus, string> = {
  pending: "Payment pending",
  paid: "Paid",
  cod_due: "Cash on delivery",
  failed: "Payment failed",
  refunded: "Refunded",
  void: "No payment due",
};
/** The one step an order can move forward to from each status. */
export const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = { confirmed: "packed", packed: "shipped", shipped: "delivered" };

export const newOrderId = () => "NO-" + randomBytes(5).toString("hex").toUpperCase();

type OrderRow = {
  id: string;
  created_at: Date;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  payment_ref: string | null;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon: string | null;
};
type ItemRow = { variant_id: string; product_slug: string; name: string; size_label: string; unit_price: number; qty: number };

function event(c: PoolClient, id: string, status: string, note: string | null) {
  return c.query("INSERT INTO order_events (order_id, status, note) VALUES ($1, $2, $3)", [id, status, note]);
}
const afterOrderChange = () => invalidate("catalog:", "stats:", "activity");

export async function createOrder(customer: CustomerInput, totals: Totals) {
  const id = newOrderId();
  await transaction(async (c) => {
    await c.query(
      `INSERT INTO orders (id, status, payment_status, name, phone, email, address, city, state, pincode,
                           subtotal, discount, shipping, total, coupon)
       VALUES ($1, 'awaiting_payment', 'pending', $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      [id, customer.name, customer.phone, customer.email, customer.address, customer.city, customer.state, customer.pincode,
        totals.subtotal, totals.discount, totals.shipping, totals.total, totals.couponApplied],
    );
    const values = totals.lines
      .map((_, i) => `($1, $${i * 6 + 2}, $${i * 6 + 3}, $${i * 6 + 4}, $${i * 6 + 5}, $${i * 6 + 6}, $${i * 6 + 7})`)
      .join(", ");
    await c.query(
      `INSERT INTO order_items (order_id, variant_id, product_slug, name, size_label, unit_price, qty) VALUES ${values}`,
      [id, ...totals.lines.flatMap((l) => [l.variantId, l.slug, l.name, l.sizeLabel, l.unitPrice, l.qty])],
    );
    await event(c, id, "placed", "Order placed");
  });
  return { id };
}

export async function getOrder(id: string): Promise<Order | null> {
  const [rows, items, events] = await Promise.all([
    query<OrderRow>("SELECT * FROM orders WHERE id = $1", [id]),
    query<ItemRow>("SELECT * FROM order_items WHERE order_id = $1 ORDER BY unit_price * qty DESC", [id]),
    query<{ status: string; note: string | null; created_at: Date }>(
      "SELECT status, note, created_at FROM order_events WHERE order_id = $1 ORDER BY created_at, id",
      [id],
    ),
  ]);
  const o = rows[0];
  if (!o) return null;
  return {
    id: o.id,
    createdAt: o.created_at.toISOString(),
    status: o.status,
    paymentStatus: o.payment_status,
    paymentMethod: o.payment_method,
    paymentRef: o.payment_ref,
    customer: { name: o.name, phone: o.phone, email: o.email, address: o.address, city: o.city, state: o.state, pincode: o.pincode },
    totals: {
      lines: items.map((i) => ({
        variantId: i.variant_id,
        slug: i.product_slug,
        name: i.name,
        sizeLabel: i.size_label,
        unitPrice: i.unit_price,
        qty: i.qty,
        total: i.unit_price * i.qty,
      })),
      subtotal: o.subtotal,
      discount: o.discount,
      shipping: o.shipping,
      total: o.total,
      couponApplied: o.coupon,
    },
    events: events.map((e) => ({ status: e.status, note: e.note, at: e.created_at.toISOString() })),
  };
}

class OutOfStock extends Error {}
export type PayResult = { ok: true } | { ok: false; status: number; error: string };

/**
 * Takes payment for an order. Stock is reserved first, in one transaction with row
 * locks, so two customers can never both buy the last bottle. If the payment fails,
 * the stock is put back.
 */
export async function payOrder(id: string, p: PayInput): Promise<PayResult> {
  let reserved: { ok: true; total: number } | { ok: false; status: number; error: string };
  try {
    reserved = await transaction(async (c) => {
      const o = (await c.query("SELECT status, stock_reserved, total FROM orders WHERE id = $1 FOR UPDATE", [id])).rows[0];
      if (!o) return { ok: false as const, status: 404, error: "Order not found" };
      if (o.status !== "awaiting_payment") return { ok: false as const, status: 409, error: "This order is already confirmed" };
      if (o.stock_reserved) return { ok: false as const, status: 409, error: "A payment for this order is already in progress" };
      const items = (await c.query<ItemRow>("SELECT * FROM order_items WHERE order_id = $1 ORDER BY variant_id", [id])).rows;
      for (const it of items) {
        const r = await c.query("UPDATE variants SET stock = stock - $2, updated_at = now() WHERE id = $1 AND stock >= $2", [it.variant_id, it.qty]);
        if (r.rowCount === 0) throw new OutOfStock(`${it.name} (${it.size_label})`);
      }
      await c.query("UPDATE orders SET stock_reserved = true WHERE id = $1", [id]);
      return { ok: true as const, total: o.total as number };
    });
  } catch (e) {
    if (e instanceof OutOfStock) {
      invalidate("catalog:");
      return { ok: false, status: 409, error: `Sorry, ${e.message} just sold out. Please go back to your cart and change it.` };
    }
    throw e;
  }
  if (!reserved.ok) return reserved;

  let paymentStatus: PaymentStatus = "cod_due";
  let ref: string | null = null;
  if (p.method !== "cod") {
    const res = await charge({ method: p.method, amount: reserved.total, cardNumber: p.method === "card" ? p.number : undefined });
    if (!res.ok) {
      await transaction(async (c) => {
        await restoreStock(c, id);
        await c.query("UPDATE orders SET payment_status = 'failed', payment_method = $2, updated_at = now() WHERE id = $1", [id, p.method]);
        await event(c, id, "payment_failed", res.message);
      });
      return { ok: false, status: 402, error: res.message };
    }
    paymentStatus = "paid";
    ref = res.ref;
  }
  await transaction(async (c) => {
    await c.query(
      "UPDATE orders SET status = 'confirmed', payment_status = $2, payment_method = $3, payment_ref = $4, updated_at = now() WHERE id = $1",
      [id, paymentStatus, p.method, ref],
    );
    await event(c, id, "confirmed", p.method === "cod" ? "Cash on delivery" : `Paid by ${p.method.toUpperCase()}`);
  });
  afterOrderChange();
  return { ok: true };
}

async function restoreStock(c: PoolClient, id: string) {
  const o = (await c.query("SELECT stock_reserved FROM orders WHERE id = $1 FOR UPDATE", [id])).rows[0];
  if (!o?.stock_reserved) return;
  await c.query(
    `UPDATE variants v SET stock = v.stock + oi.qty, updated_at = now()
       FROM order_items oi WHERE oi.order_id = $1 AND oi.variant_id = v.id`,
    [id],
  );
  await c.query("UPDATE orders SET stock_reserved = false WHERE id = $1", [id]);
}

/** Admin: move an order one step forward, or cancel it. Returns an error message, or null on success. */
export async function changeOrderStatus(id: string, to: OrderStatus): Promise<string | null> {
  const err = await transaction(async (c) => {
    const o = (await c.query("SELECT status, payment_status FROM orders WHERE id = $1 FOR UPDATE", [id])).rows[0];
    if (!o) return "Order not found";
    const from = o.status as OrderStatus;
    if (to === "cancelled") {
      if (from === "delivered" || from === "cancelled") return `A ${STATUS_LABEL[from].toLowerCase()} order can't be cancelled`;
      await restoreStock(c, id);
      const pay = o.payment_status === "paid" ? "refunded" : "void";
      await c.query("UPDATE orders SET status = 'cancelled', payment_status = $2, updated_at = now() WHERE id = $1", [id, pay]);
      await event(c, id, "cancelled", pay === "refunded" ? "Cancelled and refunded" : "Cancelled");
      return null;
    }
    if (NEXT_STATUS[from] !== to) return `Can't move a ${STATUS_LABEL[from].toLowerCase()} order to ${STATUS_LABEL[to].toLowerCase()}`;
    const collected = to === "delivered" && o.payment_status === "cod_due";
    await c.query(
      `UPDATE orders SET status = $2, payment_status = CASE WHEN $3 THEN 'paid' ELSE payment_status END, updated_at = now() WHERE id = $1`,
      [id, to, collected],
    );
    await event(c, id, to, collected ? "Delivered, cash collected" : null);
    return null;
  });
  if (!err) afterOrderChange();
  return err;
}

export type OrderListRow = {
  id: string;
  created_at: Date;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: PaymentMethod | null;
  name: string;
  city: string;
  phone: string;
  total: number;
  units: number;
};

export async function listOrders(opts: { status?: OrderStatus | null; q?: string | null; limit?: number } = {}) {
  const q = opts.q?.trim() ? `%${opts.q.trim()}%` : null;
  return query<OrderListRow>(
    `SELECT o.id, o.created_at, o.status, o.payment_status, o.payment_method, o.name, o.city, o.phone, o.total,
            (SELECT COALESCE(SUM(qty), 0)::int FROM order_items WHERE order_id = o.id) AS units
       FROM orders o
      WHERE ($1::text IS NULL OR o.status = $1)
        AND ($2::text IS NULL OR o.id ILIKE $2 OR o.name ILIKE $2 OR o.phone ILIKE $2 OR o.city ILIKE $2)
      ORDER BY o.created_at DESC
      LIMIT $3`,
    [opts.status ?? null, q, opts.limit ?? 100],
  );
}

export async function statusCounts() {
  const rows = await query<{ status: OrderStatus; n: number }>("SELECT status, COUNT(*)::int AS n FROM orders GROUP BY status");
  return Object.fromEntries(rows.map((r) => [r.status, r.n])) as Partial<Record<OrderStatus, number>>;
}

/** Recent real purchases for the "someone just bought" notice: city and product only, never names. */
export function recentActivity() {
  return cached("activity", 60_000, async () => {
    const rows = await query<{ city: string; product: string; created_at: Date }>(
      `SELECT o.city, top.name AS product, o.created_at
         FROM orders o
         JOIN LATERAL (SELECT name FROM order_items WHERE order_id = o.id ORDER BY unit_price * qty DESC LIMIT 1) top ON true
        WHERE o.status IN ('confirmed','packed','shipped','delivered') AND o.created_at > now() - interval '14 days'
        ORDER BY o.created_at DESC LIMIT 8`,
    );
    return rows.map((r) => ({ city: r.city, product: r.product, at: r.created_at.toISOString() }));
  });
}
