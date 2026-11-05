import { inr } from "@/lib/products";
import type { Totals } from "@/lib/pricing";
import { FREE_SHIPPING_ABOVE } from "@/lib/pricing";

export function OrderSummary({ t, showFreeHint = false }: { t: Totals; showFreeHint?: boolean }) {
  const away = FREE_SHIPPING_ABOVE - (t.subtotal - t.discount);
  return (
    <div className="rounded-2xl border border-sand bg-white p-5">
      <h2 className="font-serif text-lg font-bold">Order summary</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {t.lines.map((l) => (
          <li key={l.variantId} className="flex justify-between gap-3">
            <span>{l.name} ({l.sizeLabel}) × {l.qty}</span>
            <span>{inr(l.total)}</span>
          </li>
        ))}
      </ul>
      <dl className="mt-4 space-y-1 border-t border-sand pt-3 text-sm">
        <div className="flex justify-between"><dt>Subtotal</dt><dd>{inr(t.subtotal)}</dd></div>
        {t.discount > 0 && <div className="flex justify-between text-leaf"><dt>Coupon {t.couponApplied}</dt><dd>−{inr(t.discount)}</dd></div>}
        <div className="flex justify-between"><dt>Shipping</dt><dd>{t.shipping === 0 ? "Free" : inr(t.shipping)}</dd></div>
        <div className="flex justify-between border-t border-sand pt-2 text-lg font-bold"><dt>Total</dt><dd>{inr(t.total)}</dd></div>
      </dl>
      {showFreeHint && t.shipping > 0 && away > 0 && (
        <p className="mt-3 rounded-lg bg-gold/15 p-2 text-xs text-gold-dark">Add {inr(away)} more for free shipping.</p>
      )}
    </div>
  );
}
