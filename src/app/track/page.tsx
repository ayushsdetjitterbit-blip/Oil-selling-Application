"use client";
import { useState } from "react";
import { inr } from "@/lib/products";
import { StatusSteps } from "@/components/status-steps";
import type { OrderStatus } from "@/lib/orders";

type Result = { id: string; status: OrderStatus; paymentStatus: string; total: number; createdAt: string; items: string[] };

export default function Track() {
  const [res, setRes] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function look(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true); setError(""); setRes(null);
    const f = new FormData(e.currentTarget);
    const q = new URLSearchParams({ id: String(f.get("id")), phone: String(f.get("phone")) });
    const r = await fetch(`/api/orders/track?${q}`);
    const d = await r.json();
    if (r.ok) setRes(d); else setError(d.error);
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
        <div className="mt-6 space-y-4 rounded-2xl border border-sand bg-white p-6">
          <p className="font-serif text-lg font-bold">{res.id}</p>
          {res.status === "awaiting_payment" ? <p className="text-sm text-gold-dark">Payment is not complete yet.</p> : <StatusSteps status={res.status} />}
          <ul className="list-disc pl-5 text-sm">{res.items.map((i) => <li key={i}>{i}</li>)}</ul>
          <p className="text-sm">Total {inr(res.total)} · placed {new Date(res.createdAt).toLocaleDateString("en-IN")}</p>
        </div>
      )}
    </div>
  );
}
