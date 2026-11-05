"use client";
import Link from "next/link";
import { useState } from "react";
import { inr } from "@/lib/products";
import { StatusSteps } from "@/components/status-steps";
import { OrderTimeline } from "@/components/order-timeline";
import type { OrderEvent, OrderStatus } from "@/lib/orders";

type Result = { id: string; status: OrderStatus; paymentStatus: string; total: number; createdAt: string; items: string[]; events: OrderEvent[] };

export default function Track() {
  const [res, setRes] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function look(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    setRes(null);
    const f = new FormData(e.currentTarget);
    const q = new URLSearchParams({ id: String(f.get("id")), phone: String(f.get("phone")) });
    try {
      const r = await fetch(`/api/orders/track?${q}`);
      const d = await r.json();
      if (r.ok) setRes(d);
      else setError(d.error);
    } catch {
      setError("Couldn't look up the order right now. Please try again.");
    }
    setBusy(false);
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold text-leaf-dark">Track your order</h1>
      <form onSubmit={look} className="mt-6 space-y-4 rounded-2xl border border-sand bg-white p-6">
        <div><label htmlFor="id" className="label">Order ID</label><input id="id" name="id" required placeholder="NO-XXXXXXXXXX" className="field" /></div>
        <div><label htmlFor="phone" className="label">Mobile number used for the order</label><input id="phone" name="phone" required inputMode="tel" className="field" /></div>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <button className="btn btn-primary w-full" disabled={busy}>{busy ? "Looking…" : "Track order"}</button>
      </form>
      {res && (
        <div className="rise mt-6 space-y-6 rounded-2xl border border-sand bg-white p-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-serif text-lg font-bold">{res.id}</p>
            <Link href={`/order/${res.id}`} className="text-sm font-semibold text-leaf underline">Open order page →</Link>
          </div>
          {res.status === "awaiting_payment" ? <p className="text-sm text-gold-dark">Payment is not complete yet.</p> : <StatusSteps status={res.status} />}
          <ul className="list-disc pl-5 text-sm">{res.items.map((i) => <li key={i}>{i}</li>)}</ul>
          <OrderTimeline events={res.events} />
          <p className="text-sm">Total {inr(res.total)}{res.status === "delivered" ? " · You can review your oils on the order page" : ""}</p>
        </div>
      )}
    </div>
  );
}
