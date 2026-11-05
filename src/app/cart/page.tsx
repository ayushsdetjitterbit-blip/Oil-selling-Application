"use client";
import Link from "next/link";
import { useState } from "react";
import { useCart, useCartTotals } from "@/lib/cart";
import { COUPONS } from "@/lib/pricing";
import { findVariant, inr } from "@/lib/products";
import { Bottle } from "@/components/bottle";
import { OrderSummary } from "@/components/order-summary";

export default function CartPage() {
  const { items, ready, setQty, remove, coupon, setCoupon } = useCart();
  const totals = useCartTotals();
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
        <ul className="space-y-3">
          {items.map((it) => {
            const v = findVariant(it.variantId);
            if (!v) return null;
            return (
              <li key={it.variantId} className="flex items-center gap-4 rounded-2xl border border-sand bg-white p-4">
                <div className="grid h-20 w-16 shrink-0 place-items-center rounded-lg bg-sand/50"><Bottle color={v.product.color} className="h-16" /></div>
                <div className="min-w-0 flex-1">
                  <Link href={`/shop/${v.product.slug}`} className="font-serif font-bold hover:underline">{v.product.name}</Link>
                  <p className="text-sm text-bark/60">{v.size.label} · {inr(v.size.price)} each</p>
                  <button onClick={() => remove(it.variantId)} className="mt-1 text-xs text-red-700 underline">Remove</button>
                </div>
                <div className="flex items-center rounded-full border-2 border-sand">
                  <button aria-label="Decrease" className="px-3 py-1" onClick={() => setQty(it.variantId, it.qty - 1)}>−</button>
                  <span className="w-6 text-center text-sm font-semibold">{it.qty}</span>
                  <button aria-label="Increase" className="px-3 py-1" onClick={() => setQty(it.variantId, it.qty + 1)}>+</button>
                </div>
                <p className="w-20 text-right font-bold">{inr(v.size.price * it.qty)}</p>
              </li>
            );
          })}
        </ul>
        <aside className="space-y-4">
          <div className="rounded-2xl border border-sand bg-white p-5">
            <label className="label" htmlFor="coupon">Coupon code</label>
            <div className="flex gap-2">
              <input id="coupon" className="field" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. KOLHU10" />
              <button className="btn btn-ghost !px-4" onClick={applyCoupon}>Apply</button>
            </div>
            {(msg || coupon) && <p className="mt-2 text-xs text-leaf">{msg || `Coupon applied: ${COUPONS[coupon]?.label}`}</p>}
          </div>
          <OrderSummary t={totals} showFreeHint />
          <Link href="/checkout" className="btn btn-primary w-full">Proceed to checkout</Link>
          <Link href="/shop" className="block text-center text-sm underline">Continue shopping</Link>
        </aside>
      </div>
    </div>
  );
}
