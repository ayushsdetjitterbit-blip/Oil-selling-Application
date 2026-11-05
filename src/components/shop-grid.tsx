"use client";
import { useMemo, useState } from "react";
import { fromPrice, type Product } from "@/lib/products";
import { ProductCard } from "./product-card";

export function ShopGrid({ products }: { products: Product[] }) {
  const [cat, setCat] = useState<"All" | Product["category"]>("All");
  const [sort, setSort] = useState<"popular" | "rated" | "low" | "high">("popular");
  const [q, setQ] = useState("");
  const list = useMemo(() => {
    const term = q.trim().toLowerCase();
    const f = products.filter((p) => (cat === "All" || p.category === cat) && (!term || [p.name, p.hindi, p.tagline, ...p.uses].join(" ").toLowerCase().includes(term)));
    const sold = (p: Product) => p.sold7d ?? 0;
    const stars = (p: Product) => (p.rating ? p.rating.avg * 1000 + p.rating.count : 0);
    // Stable sort keeps the catalogue order when sales or ratings are tied (e.g. a brand-new shop).
    return [...f].sort((a, b) =>
      sort === "low" ? fromPrice(a) - fromPrice(b)
      : sort === "high" ? fromPrice(b) - fromPrice(a)
      : sort === "rated" ? stars(b) - stars(a)
      : sold(b) - sold(a),
    );
  }, [products, cat, sort, q]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["All", "Cooking", "Wellness"] as const).map((c) => (
            <button key={c} onClick={() => setCat(c)}
              className={`rounded-full border-2 px-4 py-1.5 text-sm font-semibold ${cat === c ? "border-leaf bg-leaf text-white" : "border-sand bg-white"}`}>
              {c}
            </button>
          ))}
        </div>
        <input aria-label="Search oils" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search: hair, frying, til…" className="field !w-full sm:!w-64" />
        <select aria-label="Sort" value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="field !w-auto">
          <option value="popular">Best selling</option>
          <option value="rated">Top rated</option>
          <option value="low">Price: low to high</option>
          <option value="high">Price: high to low</option>
        </select>
      </div>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((p) => <div key={p.slug} className="rise"><ProductCard p={p} /></div>)}
      </div>
      {list.length === 0 && <p className="py-16 text-center text-bark/60">No oils match “{q}”.</p>}
    </>
  );
}
