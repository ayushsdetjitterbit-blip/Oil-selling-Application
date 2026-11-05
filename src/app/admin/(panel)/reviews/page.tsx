import Link from "next/link";
import { listAllReviews } from "@/lib/reviews";
import { getProduct } from "@/lib/products";
import { toggleReview } from "@/app/admin/actions";
import { Stars } from "@/components/stars";

export const metadata = { title: "Reviews" };

const date = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" });

export default async function Reviews() {
  const reviews = await listAllReviews();
  const shown = reviews.filter((r) => !r.hidden).length;
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="font-serif text-3xl font-bold text-leaf-dark">Reviews</h1>
        <p className="text-sm text-bark/60">Only customers with a delivered order can review. {shown} shown on the shop{reviews.length > shown ? `, ${reviews.length - shown} hidden` : ""}.</p>
      </div>
      {reviews.length === 0 && (
        <p className="rounded-2xl border border-dashed border-sand bg-white p-10 text-center text-sm text-bark/60">No reviews yet. When you mark an order as delivered, the customer can review it from their order page.</p>
      )}
      <ul className="space-y-3">
        {reviews.map((r) => (
          <li key={r.id} className={`rounded-2xl border bg-white p-5 ${r.hidden ? "border-dashed border-sand opacity-60" : "border-sand"}`}>
            <div className="flex flex-wrap items-center gap-3">
              <Stars value={r.rating} />
              <span className="text-sm font-semibold">{getProduct(r.productSlug)?.name ?? r.productSlug}</span>
              {r.hidden && <span className="rounded-full bg-stone-100 px-2 py-0.5 text-xs font-semibold text-stone-700">Hidden from shop</span>}
              <form action={toggleReview} className="ml-auto">
                <input type="hidden" name="id" value={r.id} /><input type="hidden" name="hidden" value={String(!r.hidden)} />
                <button className="rounded-full border border-sand px-3 py-1 text-xs font-semibold hover:bg-cream">{r.hidden ? "Show on shop" : "Hide"}</button>
              </form>
            </div>
            <p className="mt-2 text-bark/85">{r.body}</p>
            <p className="mt-2 text-xs text-bark/55">{r.name}{r.city ? ` · ${r.city}` : ""} · {date(r.createdAt)}</p>
          </li>
        ))}
      </ul>
      {reviews.length > 0 && <p className="text-xs text-bark/50">Tip: hide reviews only for spam or abuse. Honest negative reviews build trust. <Link href="/shop" className="underline">See them on the shop</Link>.</p>}
    </div>
  );
}
