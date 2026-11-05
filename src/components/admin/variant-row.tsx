"use client";
import { useActionState, useState } from "react";
import { saveVariant, type FormState } from "@/app/admin/actions";

type Props = { id: string; label: string; litres: number; price: number; mrp: number; stock: number };

/** One editable size: price, MRP and stock, with the % off and per-litre price updating as you type. */
export function VariantRow({ id, label, litres, price, mrp, stock }: Props) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveVariant, null);
  const [v, setV] = useState({ price: String(price), mrp: String(mrp), stock: String(stock) });
  const p = Number(v.price) || 0;
  const m = Number(v.mrp) || 0;
  const s = Number(v.stock);
  const off = m > 0 && p > 0 && m >= p ? Math.round(((m - p) / m) * 100) : null;
  const dirty = v.price !== String(price) || v.mrp !== String(mrp) || v.stock !== String(stock);
  const set = (k: keyof typeof v) => (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value });

  return (
    <form action={action} className="grid grid-cols-2 items-end gap-3 border-t border-sand py-3 sm:grid-cols-[110px_1fr_1fr_1fr_auto]">
      <input type="hidden" name="id" value={id} />
      <div className="col-span-2 sm:col-span-1">
        <p className="font-semibold">{label}</p>
        <p className="text-xs text-bark/55">{p > 0 ? `₹${Math.round(p / litres).toLocaleString("en-IN")}/L` : "–"}{off != null ? ` · ${off}% off` : ""}</p>
      </div>
      <label className="text-xs font-semibold text-bark/60">Price ₹
        <input name="price" inputMode="numeric" value={v.price} onChange={set("price")} className="field mt-1 !py-2 tabular-nums" />
      </label>
      <label className="text-xs font-semibold text-bark/60">MRP ₹
        <input name="mrp" inputMode="numeric" value={v.mrp} onChange={set("mrp")} className="field mt-1 !py-2 tabular-nums" />
      </label>
      <label className="text-xs font-semibold text-bark/60">In stock
        <div className="mt-1 flex gap-1">
          <input name="stock" inputMode="numeric" value={v.stock} onChange={set("stock")}
            className={`field !py-2 tabular-nums ${s === 0 ? "!border-red-300 bg-red-50" : s <= 10 ? "!border-amber-300 bg-amber-50" : ""}`} />
          <button type="button" onClick={() => setV({ ...v, stock: String((Number(v.stock) || 0) + 10) })} className="shrink-0 rounded-lg border border-sand bg-white px-2 text-xs font-semibold hover:bg-cream" aria-label={`Add 10 to ${label} stock`}>+10</button>
        </div>
      </label>
      <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
        <button className="btn btn-primary !px-4 !py-2 text-sm" disabled={pending || !dirty}>{pending ? "Saving…" : "Save"}</button>
        {state?.ok && !dirty && <span key={state.at} className="rise text-xs font-semibold text-emerald-800">✓ Live</span>}
      </div>
      {state?.error && <p role="alert" className="col-span-2 text-xs font-semibold text-red-800 sm:col-span-5">{state.error}</p>}
    </form>
  );
}
