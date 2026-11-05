import { findVariant, MAX_QTY, PRODUCTS, type Product } from "./products";

export { MAX_QTY };
export type CartLine = { variantId: string; qty: number };

export const FREE_SHIPPING_ABOVE = 999;
export const SHIPPING_FEE = 60;

export const COUPONS: Record<string, { percent: number; label: string }> = {
  KOLHU10: { percent: 10, label: "10% off" },
  WELCOME5: { percent: 5, label: "5% off" },
};

export type PricedLine = {
  variantId: string;
  slug: string;
  name: string;
  sizeLabel: string;
  unitPrice: number;
  qty: number;
  total: number;
};

export type Totals = {
  lines: PricedLine[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponApplied: string | null;
};

/**
 * Single source of truth for prices: used by the cart UI and re-run on the server
 * with prices from the database, so a tampered browser price is never trusted.
 */
export function computeTotals(input: CartLine[], couponCode?: string | null, catalog: Product[] = PRODUCTS): Totals {
  const lines: PricedLine[] = [];
  for (const l of input) {
    const v = findVariant(l.variantId, catalog);
    const qty = Math.min(MAX_QTY, Math.max(0, Math.floor(l.qty)));
    if (!v || qty < 1) continue;
    lines.push({
      variantId: l.variantId,
      slug: v.product.slug,
      name: v.product.name,
      sizeLabel: v.size.label,
      unitPrice: v.size.price,
      qty,
      total: v.size.price * qty,
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const code = couponCode?.trim().toUpperCase() ?? "";
  const coupon = COUPONS[code];
  const discount = coupon ? Math.round((subtotal * coupon.percent) / 100) : 0;
  const afterDiscount = subtotal - discount;
  const shipping = lines.length === 0 || afterDiscount >= FREE_SHIPPING_ABOVE ? 0 : SHIPPING_FEE;
  return {
    lines,
    subtotal,
    discount,
    shipping,
    total: afterDiscount + shipping,
    couponApplied: coupon ? code : null,
  };
}

export type StockProblem = { variantId: string; label: string; wanted: number; available: number };

/** Cart lines asking for more than is in stock. Empty when stock isn't tracked. */
export function stockProblems(input: CartLine[], catalog: Product[] = PRODUCTS): StockProblem[] {
  const out: StockProblem[] = [];
  for (const l of input) {
    const v = findVariant(l.variantId, catalog);
    if (!v || v.size.stock == null || l.qty <= v.size.stock) continue;
    out.push({ variantId: l.variantId, label: `${v.product.name} (${v.size.label})`, wanted: l.qty, available: v.size.stock });
  }
  return out;
}
