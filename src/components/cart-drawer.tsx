"use client";
import Link from "next/link";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useCart, useCartTotals } from "@/lib/cart";
import { findVariant, inr } from "@/lib/products";
import { Bottle } from "./bottle";
import { ShippingProgress } from "./shipping-progress";

export function CartDrawer() {
  const { items, drawerOpen, closeDrawer, setQty, remove, lastAdded } = useCart();
  const totals = useCartTotals();
  const path = usePathname();

  useEffect(() => { closeDrawer(); }, [path]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen, closeDrawer]);

  return (
    <div aria-hidden={!drawerOpen} className={`fixed inset-0 z-50 ${drawerOpen ? "" : "pointer-events-none"}`}>
      <div onClick={closeDrawer} className={`absolute inset-0 bg-leaf-dark/50 backdrop-blur-sm transition-opacity duration-300 ${drawerOpen ? "opacity-100" : "opacity-0"}`} />
      <aside role="dialog" aria-label="Your cart" className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-cream shadow-2xl transition-[transform,visibility] duration-300 ease-out ${drawerOpen ? "visible translate-x-0" : "invisible translate-x-full"}`}>
        <div className="flex items-center justify-between border-b border-sand px-5 py-4">
          <p className="font-serif text-2xl font-bold">Your cart</p>
          <button onClick={closeDrawer} aria-label="Close cart" className="grid h-9 w-9 place-items-center rounded-full hover:bg-sand">✕</button>
        </div>
        {items.length > 0 && <div className="px-5 pt-4"><ShippingProgress t={totals} /></div>}
        <ul className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
          {items.length === 0 && <li className="py-16 text-center text-bark/60">Your cart is empty.</li>}
          {items.map((it) => {
            const v = findVariant(it.variantId);
            if (!v) return null;
            const fresh = lastAdded?.variantId === it.variantId && Date.now() - lastAdded.at < 1500;
            return (
              <li key={it.variantId} className={`flex items-center gap-3 rounded-2xl border bg-paper p-3 transition ${fresh ? "border-gold ring-2 ring-gold/40" : "border-sand"}`}>
                <div className="grid h-16 w-14 shrink-0 place-items-center rounded-xl bg-sand/50"><Bottle color={v.product.color} className="h-14" /></div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{v.product.name}</p>
                  <p className="text-xs text-bark/60">{v.size.label} · {inr(v.size.price)}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <div className="flex items-center rounded-full border border-sand bg-white text-sm">
                      <button aria-label="Decrease" className="px-2.5" onClick={() => setQty(it.variantId, it.qty - 1)}>−</button>
                      <span className="w-5 text-center font-semibold">{it.qty}</span>
                      <button aria-label="Increase" className="px-2.5" onClick={() => setQty(it.variantId, it.qty + 1)}>+</button>
                    </div>
                    <button className="text-xs text-red-700 underline" onClick={() => remove(it.variantId)}>Remove</button>
                  </div>
                </div>
                <p className="font-bold">{inr(v.size.price * it.qty)}</p>
              </li>
            );
          })}
        </ul>
        <div className="space-y-3 border-t border-sand bg-paper px-5 py-4">
          <div className="flex justify-between text-lg font-bold"><span>Subtotal</span><span>{inr(totals.subtotal)}</span></div>
          <Link href="/checkout" className={`btn btn-primary w-full ${items.length ? "" : "pointer-events-none opacity-50"}`}>Checkout →</Link>
          <Link href="/cart" className="block text-center text-sm underline">View full cart</Link>
        </div>
      </aside>
    </div>
  );
}
