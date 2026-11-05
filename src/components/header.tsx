"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

export function Header() {
  const { count, ready, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [bump, setBump] = useState(0);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => { if (ready) setBump((b) => b + 1); }, [count, ready]);
  const links = [["Shop", "/shop"], ["Our Kolhu", "/about"], ["Track order", "/track"], ["Contact", "/contact"]];
  return (
    <header className="sticky top-0 z-40">
      <div className="bg-leaf-dark px-4 py-1.5 text-center text-xs text-cream/90">
        🌿 Free shipping above ₹999 · Use code <b className="text-gold">KOLHU10</b> for 10% off
      </div>
      <div className={`border-b bg-cream/85 backdrop-blur-md transition-shadow ${scrolled ? "border-sand shadow-[0_8px_24px_-16px_rgba(59,42,23,.4)]" : "border-transparent"}`}>
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link href="/" className="group flex items-center gap-2.5 text-2xl font-bold text-leaf-dark">
            <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-gold to-clay text-lg text-white shadow transition duration-700 group-hover:rotate-[360deg]">❂</span>
            Natural Oil
          </Link>
          <nav className="hidden gap-8 text-sm font-semibold md:flex">
            {links.map(([l, h]) => <Link key={h} href={h} className="relative py-1 hover:text-leaf after:absolute after:inset-x-0 after:-bottom-0.5 after:h-0.5 after:origin-left after:scale-x-0 after:bg-gold after:transition hover:after:scale-x-100">{l}</Link>)}
          </nav>
          <button onClick={openDrawer} className="btn btn-primary !px-5 !py-2 text-sm" aria-label={`Open cart, ${count} items`}>
            🛒 Cart
            {ready && count > 0 && <span key={bump} className="pop rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-leaf-dark">{count}</span>}
          </button>
        </div>
        <nav className="flex justify-center gap-6 border-t border-sand py-2 text-xs font-semibold md:hidden">
          {links.map(([l, h]) => <Link key={h} href={h}>{l}</Link>)}
        </nav>
      </div>
    </header>
  );
}
