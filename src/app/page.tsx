import Link from "next/link";
import { PRODUCTS } from "@/lib/products";
import { ProductCard } from "@/components/product-card";
import { HeroBottles } from "@/components/hero-bottles";
import { Kolhu } from "@/components/kolhu";
import { Counter } from "@/components/counter";
import { Reveal } from "@/components/reveal";

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
          <HeroBottles />
        </div>
      </section>

      <div className="overflow-hidden border-y border-sand bg-gold py-3 text-sm font-bold uppercase tracking-widest text-leaf-dark">
        <div className="marquee flex w-max gap-10 whitespace-nowrap">
          {Array.from({ length: 2 }).flatMap((_, k) => ["Groundnut", "Sesame", "Coconut", "Mustard", "Almond", "Castor"].map((n) => <span key={n + k}>❂ {n} oil</span>))}
          {Array.from({ length: 2 }).flatMap((_, k) => ["No refining", "No chemicals", "No preservatives", "Small batches"].map((n) => <span key={n + k}>✦ {n}</span>))}
        </div>
      </div>

      <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 pt-20 md:grid-cols-2">
        <Reveal>
          <Kolhu className="mx-auto w-full max-w-sm drop-shadow-xl" />
        </Reveal>
        <Reveal delay={120}>
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold-dark">Pressed the slow way</p>
          <h2 className="mt-1 text-4xl font-bold text-leaf-dark md:text-5xl">One slow turn at a time.</h2>
          <p className="mt-4 text-lg text-bark/75">Our wooden kolhu turns about 14 times a minute. That gentle pace keeps the oil below 40°C, so the flavour, colour and nutrients of the seed stay in the bottle.</p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {[[12000, "+", "happy kitchens"], [38, "°C", "max press temp"], [0, "", "chemicals added"]].map(([n, suf, l]) => (
              <div key={l as string} className="rounded-2xl border border-sand bg-paper p-4">
                <p className="text-3xl font-extrabold text-leaf"><Counter to={n as number} suffix={suf as string} /></p>
                <p className="mt-1 text-xs text-bark/60">{l}</p>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="mb-8 flex items-end justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[.2em] text-gold-dark">Fresh from the press</p><h2 className="mt-1 text-4xl font-bold text-leaf-dark">Our oils</h2></div>
          <Link href="/shop" className="text-sm font-semibold text-leaf underline underline-offset-4">View all →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{PRODUCTS.map((p, i) => <Reveal key={p.slug} delay={(i % 3) * 90}><ProductCard p={p} /></Reveal>)}</div>
      </section>

      <section className="hero-bg grain relative mt-24 overflow-hidden text-cream">
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">The kolhu way</p>
          <h2 className="mt-1 text-4xl font-bold">From seed to bottle</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([t, d, e], i) => (
              <Reveal key={t} delay={i * 110}><div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white/10">
                <div className="flex items-center justify-between"><span className="text-3xl">{e}</span><span className="text-5xl font-extrabold text-white/10">0{i + 1}</span></div>
                <p className="mt-4 text-xl font-bold">{t}</p>
                <p className="mt-1 text-sm text-cream/75">{d}</p>
              </div></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-5 px-4 pt-20 md:grid-cols-3">
        {reviews.map(([n, c, q], i) => (
          <Reveal key={n} delay={i * 110}><figure className="h-full rounded-3xl border border-sand bg-paper p-6 transition hover:-translate-y-1 hover:shadow-lg">
            <p className="text-gold">★★★★★</p>
            <blockquote className="mt-3 text-bark/85">“{q}”</blockquote>
            <figcaption className="mt-4 text-sm font-semibold">{n} <span className="font-normal text-bark/55">· {c}</span></figcaption>
          </figure></Reveal>
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
        <Reveal><div className="rounded-[2rem] bg-gradient-to-r from-gold to-[#f0c24a] p-10 text-center text-leaf-dark md:p-14">
          <h2 className="text-3xl font-bold md:text-4xl">Taste the difference of real oil.</h2>
          <p className="mt-2">Use code <b>KOLHU10</b> at checkout for 10% off your first order.</p>
          <Link href="/shop" className="btn btn-primary mt-6">Start shopping</Link>
        </div></Reveal>
      </section>
    </>
  );
}
