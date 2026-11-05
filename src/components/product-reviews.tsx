import type { Review } from "@/lib/reviews";
import { Stars } from "./stars";

const date = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });

export function ProductReviews({ reviews, counts }: { reviews: Review[]; counts: { star: number; n: number }[] }) {
  const total = counts.reduce((s, c) => s + c.n, 0);
  const avg = total ? Math.round((counts.reduce((s, c) => s + c.star * c.n, 0) / total) * 10) / 10 : 0;
  const max = Math.max(1, ...counts.map((c) => c.n));

  if (total === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-sand bg-paper p-8 text-center">
        <p className="text-3xl">🌿</p>
        <p className="mt-2 font-serif text-xl font-bold">No reviews yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-bark/70">Only customers whose order has been delivered can review, so every review here comes from a real buyer.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-8 md:grid-cols-[280px_1fr]">
      <div className="rounded-3xl border border-sand bg-paper p-6">
        <p className="font-sans text-5xl font-bold text-leaf-dark">{avg.toFixed(1)}</p>
        <Stars value={avg} className="mt-1 text-lg" />
        <p className="mt-1 text-sm text-bark/60">{total} verified review{total > 1 ? "s" : ""}</p>
        <ul className="mt-5 space-y-2" aria-label="Ratings breakdown">
          {counts.map((c) => (
            <li key={c.star} className="flex items-center gap-2 text-sm" title={`${c.star} star: ${c.n} review${c.n === 1 ? "" : "s"}`}>
              <span className="w-8 shrink-0 tabular-nums text-bark/70">{c.star} ★</span>
              <span className="h-2 flex-1 overflow-hidden rounded-full bg-chart-track">
                <span className="grow-x block h-full rounded-full bg-chart-gold" style={{ width: `${(c.n / max) * 100}%` }} />
              </span>
              <span className="w-6 shrink-0 text-right tabular-nums text-bark/70">{c.n}</span>
            </li>
          ))}
        </ul>
      </div>
      <ul className="space-y-4">
        {reviews.map((r) => (
          <li key={r.id} className="rounded-3xl border border-sand bg-paper p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Stars value={r.rating} />
              <span className="rounded-full bg-leaf/10 px-2.5 py-0.5 text-xs font-semibold text-leaf">✓ Verified buyer</span>
            </div>
            <p className="mt-3 text-bark/85">{r.body}</p>
            <p className="mt-3 text-sm font-semibold">{r.name}<span className="font-normal text-bark/55">{r.city ? ` · ${r.city}` : ""} · {date(r.createdAt)}</span></p>
          </li>
        ))}
      </ul>
    </div>
  );
}
