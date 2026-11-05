"use client";
import { useCart } from "@/lib/cart";
import { variantId, type Product } from "@/lib/products";

export function QuickAdd({ p }: { p: Product }) {
  const { add } = useCart();
  const size = p.sizes.find((s) => s.id === "1l") ?? p.sizes[0];
  return (
    <button onClick={() => add(variantId(p.slug, size.id))} className="rounded-full bg-leaf px-4 py-2 text-sm font-semibold text-white transition hover:scale-105 hover:bg-leaf-dark active:scale-95" aria-label={`Add ${p.name} ${size.label} to cart`}>
      + Add {size.label}
    </button>
  );
}
