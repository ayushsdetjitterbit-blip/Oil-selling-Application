import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProduct, PRODUCTS } from "@/lib/products";
import { getCatalog } from "@/lib/catalog";
import { getProductReviews } from "@/lib/reviews";
import { dbConfigured } from "@/lib/db";
import { BuyBox, ProductSizeProvider, ShowcaseBottle } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";
import { ProductReviews } from "@/components/product-reviews";
import { Stars } from "@/components/stars";
import { Reveal } from "@/components/reveal";
import { DropletIcon, SproutIcon, TruckIcon } from "@/components/icons";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug, PRODUCTS);
  return { title: p?.name ?? "Oil", description: p?.tagline };
}

async function reviewsFor(slug: string) {
  if (!dbConfigured()) return { reviews: [], counts: [5, 4, 3, 2, 1].map((star) => ({ star, n: 0 })) };
  try {
    return await getProductReviews(slug);
  } catch {
    return { reviews: [], counts: [5, 4, 3, 2, 1].map((star) => ({ star, n: 0 })) };
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const { products } = await getCatalog();
  const p = getProduct(slug, products);
  if (!p) notFound();
  const { reviews, counts } = await reviewsFor(slug);
  const related = products.filter((o) => o.slug !== p.slug).slice(0, 3);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="mb-4 text-sm text-bark/60"><Link href="/shop" className="underline">Shop</Link> / {p.name}</p>
      <ProductSizeProvider product={p}>
        <div className="grid gap-10 md:grid-cols-2">
          <div className="rise"><ShowcaseBottle /></div>
          <div className="rise" style={{ animationDelay: "120ms" }}>
            <p className="text-sm text-bark/60">{p.hindi}</p>
            <h1 className="font-serif text-4xl font-bold text-leaf-dark">{p.name}</h1>
            {p.rating ? (
              <a href="#reviews" className="mt-2 inline-flex items-center gap-2 text-sm hover:underline">
                <Stars value={p.rating.avg} /> <span className="text-bark/60">{p.rating.avg} · {p.rating.count} verified review{p.rating.count > 1 ? "s" : ""}</span>
              </a>
            ) : (
              <p className="mt-2 text-sm text-bark/55">New on the shop · be the first to review after delivery</p>
            )}
            <p className="mt-4 text-bark/80">{p.description}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {p.uses.map((u) => <span key={u} className="rounded-full bg-leaf/10 px-3 py-1 text-xs font-semibold text-leaf">{u}</span>)}
            </div>
            <div className="mt-6 rounded-2xl border border-sand bg-white p-5 shadow-[0_20px_40px_-30px_rgba(59,42,23,.5)]"><BuyBox /></div>
            <ul className="mt-5 space-y-2 text-sm text-bark/75">
              <li className="flex gap-2"><DropletIcon className="h-4 w-4 shrink-0 text-gold-dark" />Wooden kolhu pressed, unrefined</li>
              <li className="flex gap-2"><TruckIcon className="h-4 w-4 shrink-0 text-gold-dark" />Free shipping above ₹999 · Cash on delivery available</li>
              <li className="flex gap-2"><SproutIcon className="h-4 w-4 shrink-0 text-gold-dark" />Natural sediment may settle at the bottom. That is normal for unrefined oil.</li>
            </ul>
          </div>
        </div>
      </ProductSizeProvider>

      <section id="reviews" className="mt-16 scroll-mt-28">
        <h2 className="mb-5 font-serif text-2xl font-bold text-leaf-dark">What buyers say</h2>
        <ProductReviews reviews={reviews} counts={counts} />
      </section>

      <h2 className="mb-5 mt-16 font-serif text-2xl font-bold text-leaf-dark">You may also like</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {related.map((r, i) => <Reveal key={r.slug} delay={i * 90}><ProductCard p={r} /></Reveal>)}
      </div>
    </div>
  );
}
