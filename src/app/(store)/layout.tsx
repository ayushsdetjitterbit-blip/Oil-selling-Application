import { connection } from "next/server";
import { CartProvider } from "@/lib/cart";
import { getCatalog } from "@/lib/catalog";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { CartDrawer } from "@/components/cart-drawer";
import { LiveActivity } from "@/components/live-activity";

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  await connection(); // prices and stock are live, so render on every request
  const { products, live } = await getCatalog();
  return (
    <CartProvider catalog={products} live={live}>
      <Header />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
      <CartDrawer />
      <LiveActivity />
    </CartProvider>
  );
}
