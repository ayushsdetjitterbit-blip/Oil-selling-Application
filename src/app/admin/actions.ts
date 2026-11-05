"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { adminPasswordProblem, endSession, loginAllowed, passwordMatches, requireAdmin, startSession } from "@/lib/admin-auth";
import { changeOrderStatus, type OrderStatus } from "@/lib/orders";
import { updateVariant } from "@/lib/inventory";
import { setReviewHidden } from "@/lib/reviews";

export type FormState = { error?: string; ok?: string; at?: number } | null;

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  const problem = adminPasswordProblem();
  if (problem) return { error: problem };
  if (!(await loginAllowed())) return { error: "Too many attempts. Please wait 10 minutes and try again." };
  if (!passwordMatches(String(form.get("password") ?? ""))) return { error: "That password is not right." };
  await startSession();
  redirect("/admin");
}

export async function logout() {
  await endSession();
  redirect("/admin/login");
}

const STATUSES = ["packed", "shipped", "delivered", "cancelled"] as const;

export async function setOrderStatus(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  const to = String(form.get("to") ?? "") as OrderStatus;
  const back = String(form.get("back") ?? "");
  if (!/^NO-[0-9A-F]{10}$/.test(id) || !(STATUSES as readonly string[]).includes(to)) redirect("/admin/orders");
  const err = await changeOrderStatus(id, to);
  revalidatePath("/admin", "layout");
  const params = err ? `error=${encodeURIComponent(err)}` : `done=${to}`;
  redirect(back === "list" ? `/admin/orders?${params}&order=${id}` : `/admin/orders/${id}?${params}`);
}

const variantSchema = z
  .object({
    id: z.string().regex(/^[a-z-]+:[a-z0-9]+$/),
    price: z.coerce.number().int("Use whole rupees").min(1, "Price must be at least ₹1").max(1_000_000),
    mrp: z.coerce.number().int("Use whole rupees").min(1).max(1_000_000),
    stock: z.coerce.number().int("Stock must be a whole number").min(0, "Stock can't be negative").max(100_000),
  })
  .refine((v) => v.mrp >= v.price, { message: "MRP should be at least the selling price" });

export async function saveVariant(_prev: FormState, form: FormData): Promise<FormState> {
  await requireAdmin();
  const parsed = variantSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Check the numbers" };
  const { id, price, mrp, stock } = parsed.data;
  if (!(await updateVariant(id, price, mrp, stock))) return { error: "That product size no longer exists" };
  revalidatePath("/admin", "layout");
  revalidatePath("/", "layout");
  return { ok: "Saved", at: Date.now() };
}

export async function toggleReview(form: FormData) {
  await requireAdmin();
  const id = Number(form.get("id"));
  if (!Number.isInteger(id) || id < 1) return;
  await setReviewHidden(id, form.get("hidden") === "true");
  revalidatePath("/admin/reviews");
  revalidatePath("/", "layout");
}
