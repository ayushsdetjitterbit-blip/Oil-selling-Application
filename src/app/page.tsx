import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { Bottle } from "@/components/bottle";

const steps = [
  ["Hand-sorted seeds", "Cleaned and sun-dried. No bleaching, no machine shortcuts.", "🌱"],
  ["Slow wooden kolhu", "A wooden mortar and pestle turns slowly, so the oil never overheats.", "🪵"],
  ["Settled & filtered", "The oil rests, then is filtered through cloth. Nothing is refined.", "🫗"],
  ["Bottled fresh", "Small batches, bottled and shipped within days of pressing.", "📦"],
];
const reviews = [
  ["Meenakshi R.", "Chennai", "The sesame oil smells exactly like my grandmother's kitchen. I will never go back to refined oil."],
  ["Harpreet S.", "Ludhiana", "Real kachi ghani mustard, sharp and proper. My pickles have never turned out better."],
  ["Anita K.", "Pune", "Groundnut oil with a lovely aroma and the food tastes lighter. Delivery was quick and well packed."],
];
const faqs = [
  ["What does kolhu pressed mean?", "Seeds are crushed slowly in a wooden press at low speed, so the oil stays cool. No solvents, no high heat, no refining."],
  ["Why is there sediment at the bottom?", "Unrefined oil is only settled and filtered. A little natural sediment is normal, and a sign nothing was stripped out."],
  ["Can I pay on delivery?", "Yes. You can pay by UPI, card, or cash on delivery."],
];

export default function Home() {
  return (
    <>
      <section className="hero-bg grain relative overflow-hidden text-cream">
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div className="rise">
            <span className="inline-block rounded-full border border-gold/50 bg-gold/10 px-4 py-1 text-xs font-bold uppercase tracking-[.2em] text-gold">Kolhu pressed · Unrefined</span>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] md:text-7xl">
              Oil the way <span className="italic text-gold">grandmother</span> bought it.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-cream/80">Pure oils pressed slowly in a wooden kolhu. No refining, no bleaching, no preservatives. Just seeds, wood and time.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-gold">Shop all oils →</Link>
              <Link href="/about" className="btn btn-light">See how it&apos;s made</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/75">
              <span>✓ 100% unrefined</span><span>✓ Cold pressed</span><span>✓ Cash on delivery</span>
            </div>
          </div>
          <div className="relative mx-auto flex h-[22rem] w-full max-w-md items-end justify-center md:h-[30rem]">
            <div className="absolute inset-x-6 bottom-4 top-10 rounded-full bg-gold/25 blur-3xl" />
            <Bottle color="#C98A1C" className="float absolute bottom-2 left-0 h-52 md:h-64" />
            <Bottle color="#D9A21B" className="float relative z-10 h-72 md:h-[26rem]" />
            <Bottle color="#EFE3B0" className="float absolute bottom-2 right-0 h-52 md:h-64" />
          </div>
        </div>
      </section>

      <div className="overflow-hidden border-y border-sand bg-gold py-3 text-sm font-bold uppercase tracking-widest text-leaf-dark">
        <div className="marquee flex w-max gap-10 whitespace-nowrap">
          {Array.from({ length: 2 }).flatMap((_, k) => ["Groundnut", "Sesame", "Coconut", "Mustard", "Almond", "Castor"].map((n) => <span key={n + k}>❂ {n} oil</span>))}
          {Array.from({ length: 2 }).flatMap((_, k) => ["No refining", "No chemicals", "No preservatives", "Small batches"].map((n) => <span key={n + k}>✦ {n}</span>))}
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="mb-8 flex items-end justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-gold-dark">Fresh from the press</p><h2 className="mt-1 text-4xl font-bold text-leaf-dark">Our oils</h2></div>
          <Link href="/shop" className="text-sm font-semibold text-leaf underline underline-offset-4">View all →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{PRODUCTS.map((p) => <ProductCard key={p.slug} p={p} />)}</div>
      </section>

      <section className="hero-bg grain relative mt-24 overflow-hidden text-cream">
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">The kolhu way</p>
          <h2 className="mt-1 text-4xl font-bold">From seed to bottle</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([t, d, e], i) => (
              <div key={t} className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <div className="flex items-center justify-between"><span className="text-3xl">{e}</span><span className="text-5xl font-extrabold text-white/10">0{i + 1}</span></div>
                <p className="mt-4 text-xl font-bold">{t}</p>
                <p className="mt-1 text-sm text-cream/75">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 pt-20 md:grid-cols-3">
        {reviews.map(([n, c, q]) => (
          <figure key={n} className="rounded-3xl border border-sand bg-paper p-6">
            <p className="text-gold">★★★★★</p>
            <blockquote className="mt-3 text-bark/85">“{q}”</blockquote>
            <figcaption className="mt-4 text-sm font-semibold">{n} <span className="font-normal text-bark/55">· {c}</span></figcaption>
          </figure>
        ))}
      </section>

      <section className="mx-auto max-w-3xl px-4 pt-20">
        <h2 className="text-center text-4xl font-bold text-leaf-dark">Good questions</h2>
        <div className="mt-8 space-y-3">
          {faqs.map(([q, a]) => (
            <details key={q} className="group rounded-2xl border border-sand bg-paper p-5 open:shadow-md">
              <summary className="flex cursor-pointer list-none items-center justify-between font-semibold">{q}<span className="text-xl text-gold-dark transition group-open:rotate-45">+</span></summary>
              <p className="mt-3 text-bark/75">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-20 max-w-6xl px-4">
        <div className="rounded-[2rem] bg-gradient-to-r from-gold to-[#f0c24a] p-10 text-center text-leaf-dark md:p-14">
          <h2 className="text-3xl font-bold md:text-4xl">Taste the difference of real oil.</h2>
          <p className="mt-2">Use code <b>KOLHU10</b> at checkout for 10% off your first order.</p>
          <Link href="/shop" className="btn btn-primary mt-6">Start shopping</Link>
        </div>
      </section>
    </>
  );
}
