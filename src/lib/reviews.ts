import "server-only";
import { query, transaction } from "./db";
import { cached, invalidate } from "./cache";

export type Review = {
  id: number;
  productSlug: string;
  name: string;
  city: string | null;
  rating: number;
  body: string;
  createdAt: string;
  hidden: boolean;
};
type Row = { id: string; product_slug: string; name: string; city: string | null; rating: number; body: string; created_at: Date; hidden: boolean };
const toReview = (r: Row): Review => ({
  id: Number(r.id),
  productSlug: r.product_slug,
  name: r.name,
  city: r.city,
  rating: r.rating,
  body: r.body,
  createdAt: r.created_at.toISOString(),
  hidden: r.hidden,
});

/** "Asha Rao" → "Asha R." so reviews never show a customer's full name. */
export function displayName(full: string) {
  const parts = full.trim().split(/\s+/);
  return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.` : parts[0];
}

/** Only customers whose order was delivered can review, once per oil. Returns an error or null. */
export async function addReview(input: { orderId: string; slug: string; rating: number; body: string }): Promise<string | null> {
  const err = await transaction(async (c) => {
    const o = (await c.query("SELECT status, name, city FROM orders WHERE id = $1", [input.orderId])).rows[0];
    if (!o) return "Order not found";
    if (o.status !== "delivered") return "You can write a review once your order has been delivered";
    const inOrder = (await c.query("SELECT 1 FROM order_items WHERE order_id = $1 AND product_slug = $2", [input.orderId, input.slug])).rowCount;
    if (!inOrder) return "That oil isn't part of this order";
    const r = await c.query(
      `INSERT INTO reviews (product_slug, order_id, name, city, rating, body) VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (order_id, product_slug) DO NOTHING`,
      [input.slug, input.orderId, displayName(o.name), o.city, input.rating, input.body],
    );
    return r.rowCount === 0 ? "You've already reviewed this oil" : null;
  });
  if (!err) invalidate("catalog:ratings", "reviews:");
  return err;
}

export function getProductReviews(slug: string) {
  return cached(`reviews:${slug}`, 60_000, async () => {
    const [rows, dist] = await Promise.all([
      query<Row>("SELECT * FROM reviews WHERE product_slug = $1 AND NOT hidden ORDER BY created_at DESC LIMIT 20", [slug]),
      query<{ rating: number; n: number }>(
        "SELECT rating, COUNT(*)::int AS n FROM reviews WHERE product_slug = $1 AND NOT hidden GROUP BY rating",
        [slug],
      ),
    ]);
    const counts = [5, 4, 3, 2, 1].map((star) => ({ star, n: dist.find((d) => d.rating === star)?.n ?? 0 }));
    return { reviews: rows.map(toReview), counts };
  });
}

export function getLatestReviews(n = 3) {
  return cached(`reviews:latest:${n}`, 60_000, async () =>
    (await query<Row>("SELECT * FROM reviews WHERE NOT hidden ORDER BY created_at DESC LIMIT $1", [n])).map(toReview),
  );
}

export async function reviewedSlugs(orderId: string) {
  const rows = await query<{ product_slug: string }>("SELECT product_slug FROM reviews WHERE order_id = $1", [orderId]);
  return new Set(rows.map((r) => r.product_slug));
}

export async function listAllReviews() {
  return (await query<Row>("SELECT * FROM reviews ORDER BY created_at DESC LIMIT 300")).map(toReview);
}

export async function setReviewHidden(id: number, hidden: boolean) {
  await query("UPDATE reviews SET hidden = $2 WHERE id = $1", [id, hidden]);
  invalidate("catalog:ratings", "reviews:");
}
