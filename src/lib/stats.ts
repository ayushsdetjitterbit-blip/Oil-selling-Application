import "server-only";
import { query } from "./db";
import { listOrders } from "./orders";
import { LOW_STOCK } from "./products";

/** Days are counted in Indian time so "today" means today for the shop. */
export const STORE_TZ = "Asia/Kolkata";
const LIVE = `('confirmed','packed','shipped','delivered')`;

export async function getDashboard() {
  const [[totals], daily, top, low, recent, [subs], [rev]] = await Promise.all([
    query<{ today: number; today_orders: number; week: number; all_time: number; orders: number; avg: number; to_ship: number; awaiting: number }>(
      `SELECT
         COALESCE(SUM(total) FILTER (WHERE status IN ${LIVE} AND (created_at AT TIME ZONE $1)::date = (now() AT TIME ZONE $1)::date), 0)::int AS today,
         COUNT(*) FILTER (WHERE status IN ${LIVE} AND (created_at AT TIME ZONE $1)::date = (now() AT TIME ZONE $1)::date)::int AS today_orders,
         COALESCE(SUM(total) FILTER (WHERE status IN ${LIVE} AND created_at > now() - interval '7 days'), 0)::int AS week,
         COALESCE(SUM(total) FILTER (WHERE status IN ${LIVE}), 0)::int AS all_time,
         COUNT(*) FILTER (WHERE status IN ${LIVE})::int AS orders,
         COALESCE(ROUND(AVG(total) FILTER (WHERE status IN ${LIVE})), 0)::int AS avg,
         COUNT(*) FILTER (WHERE status IN ('confirmed','packed'))::int AS to_ship,
         COUNT(*) FILTER (WHERE status = 'awaiting_payment')::int AS awaiting
       FROM orders`,
      [STORE_TZ],
    ),
    query<{ day: string; revenue: number; orders: number }>(
      `SELECT to_char(d.day, 'YYYY-MM-DD') AS day, COALESCE(SUM(o.total), 0)::int AS revenue, COUNT(o.id)::int AS orders
         FROM generate_series(((now() AT TIME ZONE $1)::date - 13)::timestamp, (now() AT TIME ZONE $1)::date::timestamp, interval '1 day') AS d(day)
         LEFT JOIN orders o ON (o.created_at AT TIME ZONE $1)::date = d.day::date AND o.status IN ${LIVE}
        GROUP BY d.day ORDER BY d.day`,
      [STORE_TZ],
    ),
    query<{ product_slug: string; name: string; units: number; revenue: number }>(
      `SELECT oi.product_slug, MIN(oi.name) AS name, SUM(oi.qty)::int AS units, SUM(oi.qty * oi.unit_price)::int AS revenue
         FROM order_items oi JOIN orders o ON o.id = oi.order_id
        WHERE o.status IN ${LIVE} AND o.created_at > now() - interval '30 days'
        GROUP BY oi.product_slug ORDER BY units DESC LIMIT 5`,
    ),
    query<{ id: string; stock: number }>("SELECT id, stock FROM variants WHERE stock <= $1 ORDER BY stock, id", [LOW_STOCK]),
    listOrders({ limit: 6 }),
    query<{ n: number }>("SELECT COUNT(*)::int AS n FROM subscribers"),
    query<{ n: number; avg: string | null }>("SELECT COUNT(*)::int AS n, ROUND(AVG(rating)::numeric, 1) AS avg FROM reviews WHERE NOT hidden"),
  ]);
  return {
    totals,
    daily,
    top,
    low,
    recent,
    subscribers: subs.n,
    reviews: { count: rev.n, avg: rev.avg == null ? null : Number(rev.avg) },
  };
}

export async function listSubscribers(limit = 200) {
  return query<{ email: string; created_at: Date }>("SELECT email, created_at FROM subscribers ORDER BY created_at DESC LIMIT $1", [limit]);
}

export async function subscribe(email: string) {
  const rows = await query("INSERT INTO subscribers (email) VALUES ($1) ON CONFLICT (email) DO NOTHING RETURNING email", [email]);
  return rows.length > 0;
}
