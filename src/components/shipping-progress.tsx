import { FREE_SHIPPING_ABOVE, type Totals } from "@/lib/pricing";
import { inr } from "@/lib/products";

export function ShippingProgress({ t }: { t: Totals }) {
  const net = t.subtotal - t.discount;
  const pct = Math.min(100, Math.round((net / FREE_SHIPPING_ABOVE) * 100));
  const left = FREE_SHIPPING_ABOVE - net;
  return (
    <div>
      <p className="mb-1.5 text-sm">{left > 0 ? <>Add <b>{inr(left)}</b> more for <b className="text-leaf">free shipping</b></> : <b className="text-leaf">🎉 You&apos;ve unlocked free shipping!</b>}</p>
      <div className="h-2.5 overflow-hidden rounded-full bg-sand">
        <div className="h-full rounded-full bg-gradient-to-r from-gold to-leaf transition-[width] duration-700 ease-out" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
