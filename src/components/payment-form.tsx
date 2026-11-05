"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { inr } from "@/lib/products";

type Method = "upi" | "card" | "cod";
const METHODS: [Method, string, string][] = [
  ["upi", "UPI", "Pay with any UPI app"],
  ["card", "Credit / Debit card", "Visa, Mastercard, RuPay"],
  ["cod", "Cash on delivery", "Pay when the oil reaches you"],
];

export function PaymentForm({ orderId, total }: { orderId: string; total: number }) {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("upi");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function pay(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const body =
      method === "cod" ? { method }
      : method === "upi" ? { method, upiId: String(f.get("upiId") ?? "") }
      : { method, number: String(f.get("number") ?? ""), name: String(f.get("cardName") ?? ""), expiry: String(f.get("expiry") ?? ""), cvv: String(f.get("cvv") ?? "") };
    try {
      const res = await fetch(`/api/orders/${orderId}/pay`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Payment failed");
      router.push(`/order/${orderId}?placed=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={pay} className="space-y-5 rounded-2xl border border-sand bg-white p-6">
      <fieldset className="space-y-2">
        <legend className="label">Choose a payment method</legend>
        {METHODS.map(([m, t, d]) => (
          <label key={m} className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 ${method === m ? "border-leaf bg-leaf/5" : "border-sand"}`}>
            <input type="radio" name="method" checked={method === m} onChange={() => { setMethod(m); setError(""); }} className="accent-[#4a5d23]" />
            <span><span className="block font-semibold">{t}</span><span className="text-xs text-bark/60">{d}</span></span>
          </label>
        ))}
      </fieldset>

      {method === "upi" && (
        <div><label className="label" htmlFor="upiId">UPI ID</label><input id="upiId" name="upiId" required placeholder="name@upi" className="field" /></div>
      )}
      {method === "card" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="sm:col-span-2"><label className="label" htmlFor="number">Card number</label><input id="number" name="number" required inputMode="numeric" maxLength={19} placeholder="1234 5678 9012 3456" autoComplete="cc-number" className="field" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="cardName">Name on card</label><input id="cardName" name="cardName" required autoComplete="cc-name" className="field" /></div>
          <div><label className="label" htmlFor="expiry">Expiry (MM/YY)</label><input id="expiry" name="expiry" required placeholder="08/29" autoComplete="cc-exp" className="field" /></div>
          <div><label className="label" htmlFor="cvv">CVV</label><input id="cvv" name="cvv" required inputMode="numeric" maxLength={3} type="password" autoComplete="cc-csc" className="field" /></div>
        </div>
      )}
      {method === "cod" && <p className="rounded-lg bg-gold/15 p-3 text-sm text-gold-dark">Pay {inr(total)} in cash or UPI to the delivery person.</p>}

      {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <button className="btn btn-primary w-full" disabled={busy}>
        {busy ? "Processing…" : method === "cod" ? "Place order" : `Pay ${inr(total)}`}
      </button>
      <p className="text-center text-xs text-bark/50">Demo mode: no real money is charged. Card details are never stored.</p>
    </form>
  );
}
