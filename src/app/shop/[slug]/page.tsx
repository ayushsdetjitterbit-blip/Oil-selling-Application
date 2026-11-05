import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS, getProduct } from "@/lib/products";
import { Bottle } from "@/components/bottle";
import { AddToCart } from "@/components/add-to-cart";
import { ProductCard } from "@/components/product-card";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getProduct((await params).slug);
  return { title: p?.name ?? "Oil", description: p?.tagline };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getProduct((await params).slug);
  if (!p) notFound();
  const related = PRODUCTS.filter((o) => o.slug !== p.slug).slice(0, 3);
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <p className="mb-4 text-sm text-bark/60"><Link href="/shop" className="underline">Shop</Link> / {p.name}</p>
      <div className="grid gap-10 md:grid-cols-2">
        <div className="grid place-items-center rounded-3xl bg-gradient-to-b from-cream to-sand/70 py-10">
          <Bottle color={p.color} className="h-80" />
        </div>
        <div>
          <p className="text-sm text-bark/60">{p.hindi}</p>
          <h1 className="font-serif text-3xl font-bold text-leaf-dark">{p.name}</h1>
          <p className="mt-1 text-sm text-gold-dark">★ {p.rating} <span className="text-bark/50">({p.reviews} reviews)</span></p>
          <p className="mt-4 text-bark/80">{p.description}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {p.uses.map((u) => <span key={u} className="rounded-full bg-leaf/10 px-3 py-1 text-xs font-semibold text-leaf">{u}</span>)}
          </div>
          <div className="mt-6 rounded-2xl border border-sand bg-white p-5"><AddToCart product={p} /></div>
          <ul className="mt-5 space-y-1 text-sm text-bark/70">
            <li>✓ Wooden kolhu pressed, unrefined</li>
            <li>✓ Free shipping above ₹999 · Cash on delivery available</li>
            <li>✓ Natural sediment may settle at the bottom. That is a sign of purity.</li>
          </ul>
        </div>
      </div>
      <h2 className="mb-5 mt-16 font-serif text-2xl font-bold text-leaf-dark">You may also like</h2>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{related.map((r) => <ProductCard key={r.slug} p={r} />)}</div>
    </div>
  );
}
