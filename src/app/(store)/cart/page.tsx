"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart, useCartTotals, useStockProblems } from "@/lib/cart";
import { COUPONS } from "@/lib/pricing";
import { findVariant, inr, maxQty } from "@/lib/products";
import { Bottle } from "@/components/bottle";
import { OrderSummary } from "@/components/order-summary";
import { ShippingProgress } from "@/components/shipping-progress";
import { StockBadge } from "@/components/stock-badge";

export default function CartPage() {
  const { items, catalog, ready, setQty, remove, coupon, setCoupon } = useCart();
  const totals = useCartTotals();
  const problems = useStockProblems();
  const [code, setCode] = useState(coupon);
  const [msg, setMsg] = useState("");

  if (!ready) return <div className="mx-auto max-w-6xl px-4 py-16">Loading your cart…</div>;
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-serif text-3xl font-bold text-leaf-dark">Your cart is empty</h1>
        <p className="mt-2 text-bark/70">Add some kolhu pressed oil to get started.</p>
        <Link href="/shop" className="btn btn-primary mt-6">Browse oils</Link>
      </div>
    );
  }

  function applyCoupon() {
    const c = code.trim().toUpperCase();
    if (!c) { setCoupon(""); setMsg(""); return; }
    if (COUPONS[c]) { setCoupon(c); setMsg(`Coupon applied: ${COUPONS[c].label}`); }
    else { setCoupon(""); setMsg("That coupon code is not valid"); }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-leaf-dark">Your cart</h1>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <div className="rounded-2xl border border-sand bg-white p-4"><ShippingProgress t={totals} /></div>
          <ul className="space-y-3">
            {items.map((it) => {
              const v = findVariant(it.variantId, catalog);
              if (!v) return null;
              const problem = problems.find((p) => p.variantId === it.variantId);
              return (
                <li key={it.variantId} className={`rounded-2xl border bg-white p-4 ${problem ? "border-red-300" : "border-sand"}`}>
                  <div className="flex items-center gap-4">
                    <div className="grid h-20 w-16 shrink-0 place-items-center rounded-lg bg-sand/50"><Bottle color={v.product.color} className="h-16" /></div>
                    <div className="min-w-0 flex-1">
                      <Link href={`/shop/${v.product.slug}`} className="font-serif font-bold hover:underline">{v.product.name}</Link>
                      <p className="text-sm text-bark/60">{v.size.label} · {inr(v.size.price)} each</p>
                      <div className="mt-1 flex flex-wrap items-center gap-3">
                        <StockBadge size={v.size} quiet />
                        <button onClick={() => remove(it.variantId)} className="text-xs text-red-700 underline">Remove</button>
                      </div>
                    </div>
                    <div className="flex items-center rounded-full border-2 border-sand">
                      <button aria-label="Decrease" className="px-3 py-1" onClick={() => setQty(it.variantId, it.qty - 1)}>−</button>
                      <span className="w-6 text-center text-sm font-semibold">{it.qty}</span>
                      <button aria-label="Increase" className="px-3 py-1 disabled:opacity-30" disabled={it.qty >= maxQty(v.size)} onClick={() => setQty(it.variantId, it.qty + 1)}>+</button>
                    </div>
                    <p className="w-20 text-right font-bold">{inr(v.size.price * it.qty)}</p>
                  </div>
                  {problem && (
                    <p className="mt-2 text-sm font-semibold text-red-800">
                      {problem.available === 0 ? "This size just sold out. Please remove it to continue." : `Only ${problem.available} left in stock.`}
                      {problem.available > 0 && <button className="ml-2 underline" onClick={() => setQty(it.variantId, problem.available)}>Change to {problem.available}</button>}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-sand bg-white p-5">
            <label className="label" htmlFor="coupon">Coupon code</label>
            <div className="flex gap-2">
              <input id="coupon" className="field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. KOLHU10" />
              <button className="btn btn-ghost !px-4" onClick={applyCoupon}>Apply</button>
            </div>
            {(msg || coupon) && <p className="mt-2 text-xs text-leaf">{msg || `Coupon applied: ${COUPONS[coupon]?.label}`}</p>}
          </div>
          <OrderSummary t={totals} />
          <Link href="/checkout" className={`btn btn-primary w-full ${problems.length ? "pointer-events-none opacity-50" : ""}`} aria-disabled={problems.length > 0}>Proceed to checkout</Link>
          <Link href="/shop" className="block text-center text-sm underline">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
