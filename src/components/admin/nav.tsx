"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  ["/admin", "Dashboard", "📊"],
  ["/admin/orders", "Orders", "🧾"],
  ["/admin/products", "Prices & stock", "🫙"],
  ["/admin/reviews", "Reviews", "⭐"],
  ["/admin/subscribers", "Subscribers", "✉️"],
] as const;

export function AdminNav() {
  const path = usePathname();
  return (
    <nav className="flex shrink-0 gap-1 md:flex-col">
      {LINKS.map(([href, label, icon]) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}
            className={`flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2 text-sm font-semibold transition ${active ? "bg-gold text-leaf-dark" : "text-cream/80 hover:bg-white/10"}`}>
            <span aria-hidden>{icon}</span>{label}
          </Link>
        );
      })}
    </nav>
  );
}
