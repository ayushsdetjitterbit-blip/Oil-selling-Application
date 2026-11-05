import Link from "next/link";
import { fromPrice, inr, type Product } from "@/lib/products";
import { Bottle } from "./bottle";

export function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/shop/${p.slug}`} className="group flex flex-col overflow-hidden rounded-3xl border border-sand bg-paper transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_40px_-20px_rgba(59,42,23,.35)]">
      <div className="relative grid h-64 place-items-center overflow-hidden bg-gradient-to-b from-[#fff3d4] to-sand/70">
        <div className="absolute -bottom-16 h-44 w-44 rounded-full opacity-40 blur-2xl transition group-hover:opacity-70" style={{ background: p.color }} />
        {p.tag && <span className="absolute left-3 top-3 z-10 rounded-full bg-leaf-dark px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold">{p.tag}</span>}
        <Bottle color={p.color} className="relative h-48 transition duration-500 group-hover:-translate-y-1 group-hover:scale-110 group-hover:-rotate-2" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs text-bark/55">{p.hindi}</p>
        <h3 className="text-xl font-bold">{p.name}</h3>
        <p className="mt-1 text-sm text-bark/70">{p.tagline}</p>
        <p className="mt-2 text-xs text-gold-dark">{"★".repeat(Math.round(p.rating))} <span className="text-bark/50">{p.rating} ({p.reviews})</span></p>
        <div className="mt-auto flex items-end justify-between pt-4">
          <p className="text-sm text-bark/60">From <span className="text-xl font-bold text-leaf">{inr(fromPrice(p))}</span></p>
          <span className="rounded-full bg-leaf px-4 py-1.5 text-sm font-semibold text-white transition group-hover:bg-leaf-dark">View →</span>
        </div>
      </div>
    </Link>
  );
}
