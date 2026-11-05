import Link from "next/link";
import { fromPrice, inr, type Product } from "@/lib/products";
import { Bottle } from "./bottle";

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/shop/${p.slug}`} className="group flex flex-col overflow-hidden rounded-2xl border border-sand bg-white transition hover:shadow-lg">
      <div className="relative grid h-56 place-items-center bg-gradient-to-b from-cream to-sand/60">
        {p.tag && <span className="absolute left-3 top-3 rounded-full bg-leaf px-3 py-1 text-xs font-semibold text-white">{p.tag}</span>}
        <Bottle color={p.color} className="h-44 transition group-hover:scale-105" />
      </div>
      <div className="flex flex-1 flex-col p-4">
        <p className="text-xs text-bark/60">{p.hindi}</p>
        <h3 className="font-serif text-lg font-bold text-bark">{p.name}</h3>
        <p className="mt-1 text-sm text-bark/70">{p.tagline}</p>
        <p className="mt-2 text-xs text-gold-dark">★ {p.rating} <span className="text-bark/50">({p.reviews})</span></p>
        <p className="mt-auto pt-3 text-sm text-bark/70">From <span className="text-lg font-bold text-leaf">{inr(fromPrice(p))}</span></p>
      </div>
    </Link>
  );
}
