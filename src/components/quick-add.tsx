"use client";
import { useCart } from "@/lib/cart";
import { isSoldOut, variantId, type Product } from "@/lib/products";

export function QuickAdd({ p }: { p: Product }) {
  const { add } = useCart();
  const available = p.sizes.filter((s) => !isSoldOut(s));
  const size = available.find((s) => s.id === "1l") ?? available[0];
  if (!size) {
    return <span className="rounded-full bg-sand px-4 py-2 text-sm font-semibold text-bark/50">Sold out</span>;
  }
  return (
    <button onClick={() => add(variantId(p.slug, size.id))} aria-label={`Add ${p.name} ${size.label} to cart`}
      className="rounded-full bg-leaf px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-leaf-dark active:scale-95">
      + Add {size.label}
    </button>
  );
}
