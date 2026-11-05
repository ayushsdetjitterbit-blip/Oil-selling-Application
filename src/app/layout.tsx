import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/lib/cart";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: { default: "Natural Oil | Wooden kolhu pressed, unrefined oils", template: "%s | Natural Oil" },
  description: "Buy pure, unrefined, cold pressed oils made the traditional way in a wooden kolhu. Groundnut, sesame, coconut, mustard and more.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          <main className="min-h-[70vh]">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
