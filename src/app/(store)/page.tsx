import Link from "next/link";
import { getCatalog } from "@/lib/catalog";
import { dbConfigured } from "@/lib/db";
import { getLatestReviews, type Review } from "@/lib/reviews";
import { ProductCard } from "@/components/product-card";
import { HeroBottles } from "@/components/hero-bottles";
import { Kolhu } from "@/components/kolhu";
import { Counter } from "@/components/counter";
import { Reveal } from "@/components/reveal";
import { Stars } from "@/components/stars";
import { CheckIcon, DropletIcon, FunnelIcon, RotateIcon, SproutIcon } from "@/components/icons";

const steps: [string, string, React.ReactNode][] = [
  ["Hand-sorted seeds", "Cleaned and sun-dried. No bleaching, no machine shortcuts.", <SproutIcon key="1" className="h-6 w-6" />],
  ["Slow wooden kolhu", "A wooden mortar and pestle turns slowly, so the oil never overheats.", <RotateIcon key="2" className="h-6 w-6" />],
  ["Settled & filtered", "The oil rests, then is filtered through cloth. Nothing is refined.", <FunnelIcon key="3" className="h-6 w-6" />],
  ["Bottled fresh", "Small batches, bottled and shipped soon after pressing.", <DropletIcon key="4" className="h-6 w-6" />],
];
const faqs = [
  ["What does kolhu pressed mean?", "Seeds are crushed slowly in a wooden press at low speed, so the oil stays cool. No solvents, no high heat, no refining."],
  ["Why is there sediment at the bottom?", "Unrefined oil is only settled and filtered. A little natural sediment is normal, and a sign nothing was stripped out."],
  ["Can I pay on delivery?", "Yes. You can pay by UPI, card, or cash on delivery."],
  ["Are the reviews real?", "Yes. Only customers whose order has been delivered can write a review, and each one is marked as a verified buyer."],
];

async function latestReviews(): Promise<Review[]> {
  if (!dbConfigured()) return [];
  try {
    return await getLatestReviews(3);
  } catch {
    return [];
  }
}

export default async function Home() {
  const [{ products }, reviews] = await Promise.all([getCatalog(), latestReviews()]);
  const byName = new Map(products.map((p) => [p.slug, p.name]));
  return (
    <>
      <section className="hero-bg grain relative overflow-hidden text-cream">
        <div className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-[1.1fr_1fr] md:py-24">
          <div className="rise">
            <span className="inline-block rounded-full border border-gold/50 bg-gold/10 px-4 py-1 text-xs font-bold uppercase tracking-[.2em] text-gold">Kolhu pressed · Unrefined</span>
            <h1 className="mt-5 text-5xl font-extrabold leading-[1.05] md:text-7xl">
              Oil the way <span className="shimmer-text italic">grandmother</span> bought it.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-cream/80">Pure oils pressed slowly in a wooden kolhu. No refining, no bleaching, no preservatives. Just seeds, wood and time.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/shop" className="btn btn-gold">Shop all oils →</Link>
              <Link href="/about" className="btn btn-light">See how it&apos;s made</Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-cream/75">
              {["100% unrefined", "Wood pressed", "Cash on delivery"].map((t) => <span key={t} className="inline-flex items-center gap-1.5"><CheckIcon className="h-4 w-4 text-gold" />{t}</span>)}
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
          <p className="mt-4 text-lg text-bark/75">A wooden kolhu turns slowly, so the oil is never heated by fast machinery. The flavour, colour and aroma of the seed stay in the bottle.</p>
          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            {([[100, "%", "unrefined"], [1, "", "ingredient: the seed"], [0, "", "chemicals or preservatives"]] as const).map(([n, suf, l]) => (
              <div key={l} className="rounded-2xl border border-sand bg-paper p-4">
                <p className="font-sans text-3xl font-bold text-leaf"><Counter to={n} suffix={suf} /></p>
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
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{products.map((p, i) => <Reveal key={p.slug} delay={(i % 3) * 90}><ProductCard p={p} /></Reveal>)}</div>
      </section>

      <section className="hero-bg grain relative mt-24 overflow-hidden text-cream">
        <div className="relative z-10 mx-auto max-w-6xl px-4 py-20">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">The kolhu way</p>
          <h2 className="mt-1 text-4xl font-bold">From seed to bottle</h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map(([t, d, e], i) => (
              <Reveal key={t} delay={i * 110}><div className="h-full rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur transition hover:-translate-y-1 hover:bg-white/10">
                <div className="flex items-center justify-between"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/10 text-gold">{e}</span><span className="text-5xl font-extrabold text-white/10">0{i + 1}</span></div>
                <p className="mt-4 text-xl font-bold">{t}</p>
                <p className="mt-1 text-sm text-cream/75">{d}</p>
              </div></Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pt-20">
        <div className="mb-8">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold-dark">Verified buyers only</p>
          <h2 className="mt-1 text-4xl font-bold text-leaf-dark">From real kitchens</h2>
        </div>
        {reviews.length > 0 ? (
          <div className="grid gap-5 md:grid-cols-3">
            {reviews.map((r, i) => (
              <Reveal key={r.id} delay={i * 110}><figure className="flex h-full flex-col rounded-3xl border border-sand bg-paper p-6 transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-center justify-between gap-2"><Stars value={r.rating} /><span className="inline-flex items-center gap-1 rounded-full bg-leaf/10 px-2.5 py-0.5 text-xs font-semibold text-leaf"><CheckIcon className="h-3 w-3" />Verified</span></div>
                <blockquote className="mt-3 flex-1 text-bark/85">“{r.body}”</blockquote>
                <figcaption className="mt-4 text-sm font-semibold">{r.name} <span className="font-normal text-bark/55">· {r.city} · {byName.get(r.productSlug)}</span></figcaption>
              </figure></Reveal>
            ))}
          </div>
        ) : (
          <Reveal><div className="rounded-3xl border border-dashed border-sand bg-paper p-8 text-center">
            <p className="font-serif text-xl font-bold">Reviews appear here after the first deliveries</p>
            <p className="mx-auto mt-1 max-w-lg text-sm text-bark/70">We don&apos;t show made-up testimonials. Every review on this shop is written by a customer after their order is delivered.</p>
            <Link href="/shop" className="btn btn-primary mt-5">Be one of the first</Link>
          </div></Reveal>
        )}
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
        <Reveal><div className="rounded-[2rem] bg-gradient-to-r from-gold to-[var(--accent-hover)] p-10 text-center text-leaf-dark md:p-14">
          <h2 className="text-3xl font-bold md:text-4xl">Taste the difference of real oil.</h2>
          <p className="mt-2">Use code <b>KOLHU10</b> at checkout for 10% off your order.</p>
          <Link href="/shop" className="btn btn-primary mt-6">Start shopping</Link>
        </div></Reveal>
      </section>
    </>
  );
}
