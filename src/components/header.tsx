"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export function Header() {
  const { count, ready } = useCart();
  const links = [
    ["Shop", "/shop"],
    ["Our Kolhu", "/about"],
    ["Track order", "/track"],
    ["Contact", "/contact"],
  ];
  return (
    <header className="sticky top-0 z-30 border-b border-sand bg-cream/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-serif text-xl font-bold text-leaf">
          <span aria-hidden className="grid h-8 w-8 place-items-center rounded-full bg-gold text-white">॥</span>
          Natural Oil
        </Link>
        <nav className="hidden gap-6 text-sm font-medium text-bark md:flex">
          {links.map(([l, h]) => (
            <Link key={h} href={h} className="hover:text-leaf">{l}</Link>
          ))}
        </nav>
        <Link href="/cart" className="relative rounded-full bg-leaf px-4 py-2 text-sm font-semibold text-white hover:bg-leaf-dark">
          Cart
          {ready && count > 0 && (
            <span className="ml-2 rounded-full bg-gold px-2 py-0.5 text-xs text-bark">{count}</span>
          )}
        </Link>
      </div>
      <nav className="flex justify-center gap-5 border-t border-sand py-2 text-xs font-medium text-bark md:hidden">
        {links.map(([l, h]) => (
          <Link key={h} href={h}>{l}</Link>
        ))}
      </nav>
    </header>
  );
}
