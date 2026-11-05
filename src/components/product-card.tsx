import Link from "next/link";
import { fromPrice, inr, type Product } from "@/lib/products";
import { Bottle } from "./bottle";
import { QuickAdd } from "./quick-add";

export function ProductCard({ p }: { p: Product }) {
  const best = Math.max(...p.sizes.map((s) => Math.round(((s.mrp - s.price) / s.mrp) * 100)));
  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl border border-sand bg-paper transition duration-300 hover:-translate-y-1.5 hover:shadow-[0_28px_44px_-22px_rgba(59,42,23,.45)]">
      <Link href={`/shop/${p.slug}`} className="relative grid h-64 place-items-center overflow-hidden bg-gradient-to-b from-[#fff3d4] to-sand/70">
        <div className="absolute -bottom-16 h-48 w-48 rounded-full opacity-40 blur-2xl transition duration-500 group-hover:scale-125 group-hover:opacity-80" style={{ background: p.color }} />
        {p.tag && <span className="absolute left-3 top-3 z-10 rounded-full bg-leaf-dark px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">{p.tag}</span>}
        <span className="absolute right-3 top-3 z-10 rounded-full bg-clay px-2.5 py-1 text-[11px] font-bold text-white">Up to {best}% off</span>
        <Bottle color={p.color} className="relative h-48 transition duration-500 group-hover:-translate-y-2 group-hover:scale-110 group-hover:-rotate-3" />
      </Link>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-bark/55">{p.hindi}</p>
        <Link href={`/shop/${p.slug}`} className="text-xl font-bold hover:text-leaf">{p.name}</Link>
        <p className="mt-1 text-sm text-bark/70">{p.tagline}</p>
        <p className="mt-2 text-xs text-gold-dark">{"★".repeat(Math.round(p.rating))} <span className="text-bark/50">{p.rating} ({p.reviews})</span></p>
        <div className="mt-auto flex items-end justify-between gap-2 pt-4">
          <p className="text-sm text-bark/60">From <span className="block text-2xl font-bold text-leaf">{inr(fromPrice(p))}</span></p>
          <QuickAdd p={p} />
        </div>
      </div>
    </div>
  );
}
