import "server-only";
import { query } from "./db";
import { invalidate } from "./cache";
import { PRODUCTS } from "./products";

export type VariantAdminRow = { id: string; product_slug: string; price: number; mrp: number; stock: number; updated_at: Date };

/** All sizes in catalogue order, with live price, MRP and stock. */
export async function listVariants() {
  const rows = await query<VariantAdminRow>("SELECT id, product_slug, price, mrp, stock, updated_at FROM variants");
  const order = new Map<string, number>(PRODUCTS.flatMap((p, i) => p.sizes.map((s, j) => [`${p.slug}:${s.id}`, i * 10 + j] as [string, number])));
  return rows.filter((r) => order.has(r.id)).sort((a, b) => order.get(a.id)! - order.get(b.id)!);
}

export async function updateVariant(id: string, price: number, mrp: number, stock: number) {
  const rows = await query("UPDATE variants SET price = $2, mrp = $3, stock = $4, updated_at = now() WHERE id = $1 RETURNING id", [id, price, mrp, stock]);
  invalidate("catalog:");
  return rows.length > 0;
}
