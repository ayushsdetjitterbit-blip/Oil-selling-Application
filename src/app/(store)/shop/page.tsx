import type { Metadata } from "next";
import { getCatalog } from "@/lib/catalog";
import { ShopGrid } from "@/components/shop-grid";

export const metadata: Metadata = { title: "Shop all oils" };

export default async function Shop() {
  const { products } = await getCatalog();
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-leaf-dark">Shop all oils</h1>
      <p className="mb-6 mt-1 text-bark/70">Every oil is kolhu pressed and unrefined. Prices and stock update live.</p>
      <ShopGrid products={products} />
    </div>
  );
}
