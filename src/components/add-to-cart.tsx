"use client";
import { createContext, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { inr, isSoldOut, maxQty, perLitre, variantId, type Product } from "@/lib/products";
import { Bottle } from "./bottle";
import { StockBadge } from "./stock-badge";

type SizeCtx = { product: Product; sizeId: string; setSizeId: (id: string) => void };
const Ctx = createContext<SizeCtx | null>(null);
const useSize = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("inside ProductSizeProvider only");
  return { ...c, size: c.product.sizes.find((s) => s.id === c.sizeId) ?? c.product.sizes[0] };
};

/** Shares the chosen size between the bottle picture and the buy box. */
export function ProductSizeProvider({ product, children }: { product: Product; children: React.ReactNode }) {
  const first = product.sizes.find((s) => !isSoldOut(s)) ?? product.sizes[0];
  const [sizeId, setSizeId] = useState(first.id);
  return <Ctx.Provider value={{ product, sizeId, setSizeId }}>{children}</Ctx.Provider>;
}

/** The big bottle: it fills up and grows as a bigger size is chosen. */
export function ShowcaseBottle() {
  const { product, size } = useSize();
  const rank = product.sizes.findIndex((s) => s.id === size.id);
  const n = product.sizes.length;
  const level = n > 1 ? 0.55 + (0.42 * rank) / (n - 1) : 0.8;
  const scale = n > 1 ? 0.88 + (0.18 * rank) / (n - 1) : 1;
  return (
    <div className="relative grid min-h-[22rem] place-items-center overflow-hidden rounded-3xl bg-gradient-to-b from-[#fff3d4] to-sand/70 py-10">
      <div aria-hidden className="absolute bottom-0 h-56 w-56 rounded-full opacity-50 blur-3xl transition-all duration-700" style={{ background: product.color, transform: `scale(${scale})` }} />
      <Bottle color={product.color} level={level} className="relative h-80 transition-transform duration-700 ease-out" style={{ transform: `scale(${scale})` }} />
      <span key={size.id} className="pop absolute bottom-4 right-4 rounded-full bg-paper/90 px-3 py-1 text-sm font-bold text-leaf-dark shadow">{size.label}</span>
    </div>
  );
}

export function BuyBox() {
  const { product, size, setSizeId } = useSize();
  const { add, closeDrawer, items } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const id = variantId(product.slug, size.id);
  const inCart = items.find((i) => i.variantId === id)?.qty ?? 0;
  const canAdd = Math.max(0, maxQty(size) - inCart);
  const q = Math.max(1, Math.min(qty, canAdd || 1));
  const soldOut = isSoldOut(size);
  const off = Math.round(((size.mrp - size.price) / size.mrp) * 100);

  return (
    <div>
      <p className="label">Choose size</p>
      <div className="flex flex-wrap gap-2">
        {product.sizes.map((s) => {
          const out = isSoldOut(s);
          return (
            <button key={s.id} onClick={() => { setSizeId(s.id); setQty(1); }} aria-pressed={s.id === size.id}
              className={`rounded-xl border-2 px-4 py-2 text-sm font-semibold transition ${s.id === size.id ? "border-leaf bg-leaf/10 text-leaf" : "border-sand bg-white hover:border-leaf/40"} ${out ? "text-bark/40 line-through" : ""}`}>
              {s.label}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span key={`${size.id}-${q}`} className="pop font-sans text-4xl font-bold text-leaf">{inr(size.price * q)}</span>
        <span className="text-bark/50 line-through">{inr(size.mrp * q)}</span>
        {off > 0 && <span className="rounded bg-gold/20 px-2 py-0.5 text-xs font-bold text-gold-dark">{off}% off</span>}
        <StockBadge size={size} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="flex items-center rounded-full border-2 border-sand bg-white">
          <button aria-label="Decrease quantity" className="px-4 py-2 text-lg disabled:opacity-30" disabled={q <= 1} onClick={() => setQty(q - 1)}>−</button>
          <span className="w-8 text-center font-semibold" aria-live="polite">{q}</span>
          <button aria-label="Increase quantity" className="px-4 py-2 text-lg disabled:opacity-30" disabled={q >= canAdd} onClick={() => setQty(q + 1)}>+</button>
        </div>
        <button className="btn btn-primary" disabled={soldOut || canAdd < 1} onClick={() => { add(id, q); setQty(1); }}>
          {soldOut ? "Sold out" : canAdd < 1 ? "Max in cart" : "Add to cart"}
        </button>
        <button className="btn btn-gold" disabled={soldOut || canAdd < 1} onClick={() => { add(id, q); closeDrawer(); router.push("/checkout"); }}>Buy now</button>
      </div>
      <p className="mt-3 text-sm text-bark/60">
        {off > 0 && <>You save <b className="text-leaf">{inr((size.mrp - size.price) * q)}</b> · </>}
        {inr(perLitre(size))} per litre
        {inCart > 0 && <> · <b>{inCart}</b> already in your cart</>}
      </p>
      {product.sold7d ? <p className="mt-2 text-sm font-semibold text-clay">🔥 {product.sold7d} bought in the last 7 days</p> : null}
    </div>
  );
}
