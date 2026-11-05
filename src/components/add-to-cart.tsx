"use client";
import { useState } from "react";
import Link from "next/link";
import { useCart } from "@/lib/cart";
import { inr, variantId, type Product } from "@/lib/products";

export function AddToCart({ product }: { product: Product }) {
  const { add } = useCart();
  const [sizeId, setSizeId] = useState(product.sizes[0].id);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const size = product.sizes.find((s) => s.id === sizeId)!;
  const off = Math.round(((size.mrp - size.price) / size.mrp) * 100);

  return (
    <div>
      <p className="label">Choose size</p>
      <div className="flex flex-wrap gap-2">
        {product.sizes.map((s) => (
          <button key={s.id} onClick={() => { setSizeId(s.id); setAdded(false); }}
            className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold ${s.id === sizeId ? "border-leaf bg-leaf/10 text-leaf" : "border-sand bg-white"}`}>
            {s.label}
          </button>
        ))}
      </div>
      <p className="mt-5 flex items-baseline gap-3">
        <span className="text-3xl font-bold text-leaf">{inr(size.price)}</span>
        <span className="text-bark/50 line-through">{inr(size.mrp)}</span>
        <span className="rounded bg-gold/20 px-2 py-0.5 text-xs font-bold text-gold-dark">{off}% off</span>
      </p>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border-2 border-sand bg-white">
          <button aria-label="Decrease quantity" className="px-4 py-2 text-lg" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
          <span className="w-8 text-center font-semibold">{qty}</span>
          <button aria-label="Increase quantity" className="px-4 py-2 text-lg" onClick={() => setQty((q) => Math.min(20, q + 1))}>+</button>
        </div>
        <button className="btn btn-primary" onClick={() => { add(variantId(product.slug, sizeId), qty); setAdded(true); }}>
          Add to cart
        </button>
      </div>
      {added && (
        <p className="mt-3 text-sm text-leaf">
          Added to your cart. <Link href="/cart" className="font-semibold underline">View cart & checkout →</Link>
        </p>
      )}
    </div>
  );
}
