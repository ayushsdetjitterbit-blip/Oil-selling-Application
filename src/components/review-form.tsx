"use client";
import { useActionState, useState } from "react";
import { submitReview, type ReviewState } from "@/app/(store)/actions";

const WORDS = ["", "Not good", "Okay", "Good", "Very good", "Excellent"];

export function ReviewForm({ orderId, slug, name }: { orderId: string; slug: string; name: string }) {
  const [state, action, pending] = useActionState<ReviewState, FormData>(submitReview, null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  if (state?.ok) {
    return <p className="rise rounded-xl bg-leaf/10 p-3 text-sm font-semibold text-leaf">✓ Thank you! Your review of {name} is now on the shop.</p>;
  }
  const shown = hover || rating;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="orderId" value={orderId} />
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex items-center gap-3">
        <div role="radiogroup" aria-label={`Rate ${name}`} className="flex" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)} onFocus={() => setHover(n)} onBlur={() => setHover(0)} onClick={() => setRating(n)}
              className={`px-0.5 text-3xl leading-none transition duration-150 hover:scale-125 ${n <= shown ? "text-gold" : "text-sand"}`}>★</button>
          ))}
        </div>
        <span className="text-sm font-semibold text-bark/70">{WORDS[shown]}</span>
      </div>
      <textarea name="body" required minLength={10} maxLength={600} rows={3} className="field" placeholder="How was the taste and aroma? How did you use it?" />
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-sm text-red-800">{state.error}</p>}
      <button className="btn btn-primary !py-2 text-sm" disabled={pending || rating === 0}>{pending ? "Posting…" : "Post review"}</button>
    </form>
  );
}
