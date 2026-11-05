import Link from "next/link";
export function Footer() {
  return (
    <footer className="mt-20 bg-leaf-dark text-cream">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-serif text-xl font-bold">Natural Oil</p>
          <p className="mt-2 text-sm text-cream/80">Wooden kolhu pressed oils. Unrefined, no chemicals, no preservatives, just seeds and patience.</p>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Shop</p>
          <ul className="mt-2 space-y-1 text-cream/80">
            <li><Link href="/shop">All oils</Link></li>
            <li><Link href="/cart">Cart</Link></li>
            <li><Link href="/track">Track your order</Link></li>
          </ul>
        </div>
        <div className="text-sm">
          <p className="font-semibold">Help</p>
          <ul className="mt-2 space-y-1 text-cream/80">
            <li><Link href="/about">How we make it</Link></li>
            <li><Link href="/contact">Contact & shipping</Link></li>
          </ul>
        </div>
      </div>
      <p className="border-t border-cream/15 py-4 text-center text-xs text-cream/60">© {new Date().getFullYear()} Natural Oil. Payments in this build run in demo mode.</p>
    </footer>
  );
}
