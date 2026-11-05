"use server";
import { revalidatePath } from "next/cache";
import { addReview } from "@/lib/reviews";
import { reviewSchema } from "@/lib/validation";

export type ReviewState = { ok?: boolean; error?: string } | null;

export async function submitReview(_prev: ReviewState, form: FormData): Promise<ReviewState> {
  const parsed = reviewSchema.safeParse({
    orderId: form.get("orderId"),
    slug: form.get("slug"),
    rating: form.get("rating"),
    body: form.get("body"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Please check your review" };
  try {
    const err = await addReview(parsed.data);
    if (err) return { error: err };
  } catch (e) {
    console.error("[review]", e);
    return { error: "Couldn't save your review right now. Please try again." };
  }
  revalidatePath(`/order/${parsed.data.orderId}`);
  revalidatePath(`/shop/${parsed.data.slug}`);
  return { ok: true };
}
