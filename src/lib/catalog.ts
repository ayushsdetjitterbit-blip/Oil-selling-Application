import "server-only";
import { cache } from "react";
import { PRODUCTS, type Product } from "./products";
import { dbConfigured, query } from "./db";
import { cached } from "./cache";

export type Catalog = { products: Product[]; live: boolean };

export const LIVE_STATUSES = ["confirmed", "packed", "shipped", "delivered"] as const;
const LIVE_SQL = `('confirmed','packed','shipped','delivered')`;

const fallback = (): Catalog => ({
  products: PRODUCTS.map((p) => ({ ...p, sizes: p.sizes.map((s) => ({ ...s, stock: null })), rating: null, sold7d: 0 })),
  live: false,
});

function soldSince(days: number) {
  return cached(`catalog:sold:${days}`, 60_000, () =>
    query<{ product_slug: string; units: number }>(
      `SELECT oi.product_slug, SUM(oi.qty)::int AS units
         FROM order_items oi JOIN orders o ON o.id = oi.order_id
        WHERE o.status IN ${LIVE_SQL} AND o.created_at > now() - make_interval(days => $1)
        GROUP BY oi.product_slug`,
      [days],
    ),
  );
}

/**
 * Products with live prices, stock, ratings and recent sales from the database.
 * Falls back to the built-in defaults (and logs why) if the database isn't reachable,
 * so the shop can still be browsed.
 */
const g = globalThis as typeof globalThis & { __noDbDownUntil?: number };

export const getCatalog = cache(async (): Promise<Catalog> => {
  if (!dbConfigured()) return fallback();
  // After a failure, don't make every page wait for the database again for 30 s.
  if ((g.__noDbDownUntil ?? 0) > Date.now()) return fallback();
  try {
    const [variants, ratings, sold7, sold30] = await Promise.all([
      cached("catalog:variants", 30_000, () =>
        query<{ id: string; price: number; mrp: number; stock: number }>("SELECT id, price, mrp, stock FROM variants"),
      ),
      cached("catalog:ratings", 60_000, () =>
        query<{ product_slug: string; avg: string; count: string }>(
          `SELECT product_slug, ROUND(AVG(rating)::numeric, 1) AS avg, COUNT(*) AS count
             FROM reviews WHERE NOT hidden GROUP BY product_slug`,
        ),
      ),
      soldSince(7),
      soldSince(30),
    ]);
    const v = new Map(variants.map((r) => [r.id, r]));
    const r = new Map(ratings.map((x) => [x.product_slug, { avg: Number(x.avg), count: Number(x.count) }]));
    const s7 = new Map(sold7.map((x) => [x.product_slug, x.units]));
    const top = [...sold30].sort((a, b) => b.units - a.units)[0];
    const products = PRODUCTS.map((p) => ({
      ...p,
      tag: top && top.product_slug === p.slug ? "Bestseller" : p.tag,
      rating: r.get(p.slug) ?? null,
      sold7d: s7.get(p.slug) ?? 0,
      sizes: p.sizes.map((size) => {
        const row = v.get(`${p.slug}:${size.id}`);
        return row ? { ...size, price: row.price, mrp: row.mrp, stock: row.stock } : { ...size, stock: 0 };
      }),
    }));
    return { products, live: true };
  } catch (e) {
    g.__noDbDownUntil = Date.now() + 30_000;
    console.error("[catalog] database unavailable, showing default prices for 30 s:", e instanceof Error ? e.message : e);
    return fallback();
  }
});
