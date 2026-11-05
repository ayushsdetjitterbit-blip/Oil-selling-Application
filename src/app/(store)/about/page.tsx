import type { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "Our kolhu" };

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl font-bold text-leaf-dark">The kolhu way</h1>
      <p className="mt-4 text-lg text-bark/80">A kolhu (also called a ghani) is a wooden mortar and pestle that crushes seeds slowly, often turned by bullocks in the old days. Because it moves slowly, the oil never gets hot, so its flavour, colour and nutrients stay natural.</p>
      <h2 className="mt-10 font-serif text-2xl font-bold">Kolhu vs. refined oil</h2>
      <div className="mt-4 overflow-hidden rounded-2xl border border-sand bg-white text-sm">
        {[["", "Natural Oil (kolhu)", "Refined oil"],
          ["Extraction", "Slow wooden press, low heat", "High heat + chemical solvents"],
          ["Processing", "Settled and filtered only", "Bleached, deodorised, degummed"],
          ["Aroma & colour", "Natural, from the seed", "Neutral and pale"],
          ["Additives", "None", "Sometimes antioxidants added"]].map((r, i) => (
          <div key={i} className={`grid grid-cols-3 gap-2 p-3 ${i === 0 ? "bg-sand/60 font-bold" : "border-t border-sand"}`}>
            {r.map((c, j) => <span key={j} className={j === 0 ? "font-semibold" : ""}>{c}</span>)}
          </div>
        ))}
      </div>
      <h2 className="mt-10 font-serif text-2xl font-bold">Good to know</h2>
      <ul className="mt-3 list-disc space-y-1 pl-6 text-bark/80">
        <li>Natural sediment can settle at the bottom. That is normal, not spoilage.</li>
        <li>Store in a cool, dry place, away from sunlight.</li>
        <li>Coconut oil may solidify in winter. Warm the bottle in your hand.</li>
      </ul>
      <Link href="/shop" className="btn btn-primary mt-8">Shop the oils</Link>
    </div>
  );
}
