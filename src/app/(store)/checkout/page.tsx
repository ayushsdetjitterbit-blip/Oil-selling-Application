"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart, useCartTotals, useStockProblems } from "@/lib/cart";
import { OrderSummary } from "@/components/order-summary";

const FIELDS = [
  ["name", "Full name", "text", "name"],
  ["phone", "Mobile number", "tel", "tel"],
  ["email", "Email", "email", "email"],
  ["address", "Address (house, street, area)", "text", "street-address"],
  ["city", "City", "text", "address-level2"],
  ["state", "State", "text", "address-level1"],
  ["pincode", "Pincode", "text", "postal-code"],
] as const;

export default function Checkout() {
  const { items, coupon, ready, live } = useCart();
  const totals = useCartTotals();
  const problems = useStockProblems();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!ready) return <div className="mx-auto max-w-6xl px-4 py-16">Loading…</div>;
  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="font-serif text-2xl font-bold">Nothing to check out</h1>
        <Link href="/shop" className="btn btn-primary mt-6">Browse oils</Link>
      </div>
    );
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setBusy(true);
    const f = new FormData(e.currentTarget);
    const customer = Object.fromEntries(FIELDS.map(([k]) => [k, String(f.get(k) ?? "")]));
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, items, coupon }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Could not place order");
      router.push(`/payment/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-leaf-dark">Checkout</h1>
      <p className="mt-1 text-sm text-bark/60">Step 1 of 2: delivery details. Payment comes next.</p>
      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <form onSubmit={submit} className="space-y-4 rounded-2xl border border-sand bg-white p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {FIELDS.map(([k, label, type, ac]) => (
              <div key={k} className={k === "address" ? "sm:col-span-2" : ""}>
                <label htmlFor={k} className="label">{label}</label>
                <input id={k} name={k} type={type} autoComplete={ac} required className="field" />
              </div>
            ))}
          </div>
          {!live && (
            <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              The shop&apos;s database isn&apos;t connected, so orders can&apos;t be placed right now. (Shop owner: run <code>npm run setup</code>.)
            </p>
          )}
          {problems.length > 0 && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              Some items changed: {problems.map((p) => (p.available === 0 ? `${p.label} is sold out` : `only ${p.available} left of ${p.label}`)).join("; ")}.{" "}
              <Link href="/cart" className="font-semibold underline">Update your cart</Link>
            </p>
          )}
          {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
          <button className="btn btn-primary w-full" disabled={busy || problems.length > 0}>{busy ? "Saving…" : "Continue to payment"}</button>
        </form>
        <aside><OrderSummary t={totals} /></aside>
      </div>
    </div>
  );
}
