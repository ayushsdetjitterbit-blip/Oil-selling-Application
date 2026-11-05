"use client";
import { useState } from "react";

export function NewsletterForm() {
  const [state, setState] = useState<{ busy?: boolean; ok?: string; error?: string }>({});
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setState({ busy: true });
    try {
      const r = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
      const d = await r.json();
      setState(r.ok ? { ok: d.message } : { error: d.error });
    } catch {
      setState({ error: "Couldn't subscribe right now. Please try again." });
    }
  }
  if (state.ok) return <p className="rise rounded-xl bg-white/10 p-3 text-sm font-semibold text-gold">{state.ok}</p>;
  return (
    <form onSubmit={submit} className="space-y-2">
      <label htmlFor="nl-email" className="text-sm font-semibold">Fresh batch alerts</label>
      <p className="text-xs text-cream/70">Hear when a new batch comes off the kolhu. No spam.</p>
      <div className="flex gap-2">
        <input id="nl-email" name="email" type="email" required placeholder="you@email.com" autoComplete="email"
          className="w-full min-w-0 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-cream placeholder:text-cream/40 outline-none focus:border-gold" />
        <button className="btn btn-gold !px-4 !py-2 text-sm" disabled={state.busy}>{state.busy ? "…" : "Join"}</button>
      </div>
      {state.error && <p role="alert" className="text-xs text-red-300">{state.error}</p>}
    </form>
  );
}
