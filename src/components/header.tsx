"use client";
import Link from "next/link";
import { useCart } from "@/lib/cart";

export function Header() {
  const { count, ready } = useCart();
  const links = [["Shop", "/shop"], ["Our Kolhu", "/about"], ["Track order", "/track"], ["Contact", "/contact"]];
  return (
    <header className="sticky top-0 z-30">
      <div className="bg-leaf-dark px-4 py-1.5 text-center text-xs text-cream/90">
        🌿 Free shipping above ₹999 · Use code <b className="text-gold">KOLHU10</b> for 10% off
      </div>
      <div className="border-b border-sand bg-cream/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="flex items-center gap-2.5 text-2xl font-bold text-leaf-dark">
            <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold to-clay text-lg text-white shadow">❂</span>
            Natural Oil
          </Link>
          <nav className="hidden gap-8 text-sm font-semibold md:flex">
            {links.map(([l, h]) => <Link key={h} href={h} className="relative py-1 hover:text-leaf after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-gold after:transition hover:after:scale-x-100">{l}</Link>)}
          </nav>
          <Link href="/cart" className="btn btn-primary !px-5 !py-2 text-sm">
            🛒 Cart
            {ready && count > 0 && <span className="rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-leaf-dark">{count}</span>}
          </Link>
        </div>
        <nav className="flex justify-center gap-6 border-t border-sand py-2 text-xs font-semibold md:hidden">
          {links.map(([l, h]) => <Link key={h} href={h}>{l}</Link>)}
        </nav>
      </div>
    </header>
  );
}
