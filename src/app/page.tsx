import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Bottle } from "@/components/bottle";

const steps = [
  ["1", "Hand-sorted seeds", "Seeds are cleaned and sun-dried. No bleaching, no sorting by machine."],
  ["2", "Slow wooden kolhu", "A wooden mortar and pestle turns slowly, so the oil never overheats."],
  ["3", "Settled & filtered", "The oil rests, then is filtered through cloth. No chemicals or refining."],
  ["4", "Bottled fresh", "Bottled in small batches and shipped to you within days."],
];

export default function Home() {
  return (
    <>
      <section className="bg-gradient-to-b from-sand/60 to-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-widest text-gold-dark">Kolhu pressed · Unrefined</p>
            <h1 className="mt-3 font-serif text-4xl font-bold leading-tight text-leaf-dark md:text-5xl">
              Oil the way your grandmother bought it.
            </h1>
            <p className="mt-4 max-w-lg text-lg text-bark/80">
              Pure oils pressed slowly in a wooden kolhu. No refining, no bleaching, no preservatives. Just seeds, wood and time.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-primary">Shop all oils</Link>
              <Link href="/about" className="btn btn-ghost">See how it&apos;s made</Link>
            </div>
            <p className="mt-5 text-sm text-bark/70">Use code <b className="text-leaf">KOLHU10</b> for 10% off · Free shipping above ₹999</p>
          </div>
          <div className="flex items-end justify-center gap-2">
            <Bottle color="#C98A1C" className="h-44 md:h-56" />
            <Bottle color="#D9A21B" className="h-60 md:h-72" />
            <Bottle color="#EFE3B0" className="h-44 md:h-56" />
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 lg:grid-cols-4">
        {[["100% unrefined", "Nothing added, nothing removed"], ["Cold pressed", "Below 40°C, nutrients stay intact"], ["Small batches", "Pressed fresh every week"], ["Secure checkout", "UPI, cards or cash on delivery"]].map(([t, d]) => (
          <div key={t} className="rounded-2xl border border-sand bg-white p-5">
            <p className="font-serif text-lg font-bold text-leaf">{t}</p>
            <p className="mt-1 text-sm text-bark/70">{d}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex items-end justify-between">
          <h2 className="font-serif text-3xl font-bold text-leaf-dark">Our oils</h2>
          <Link href="/shop" className="text-sm font-semibold text-leaf underline">View all →</Link>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCTS.slice(0, 3).map((p) => <ProductCard key={p.slug} p={p} />)}
        </div>
      </section>

      <section className="mt-12 bg-leaf-dark text-cream">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <h2 className="font-serif text-3xl font-bold">From seed to bottle</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([n, t, d]) => (
              <div key={n}>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gold font-bold text-bark">{n}</span>
                <p className="mt-3 font-serif text-lg font-bold">{t}</p>
                <p className="mt-1 text-sm text-cream/80">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
