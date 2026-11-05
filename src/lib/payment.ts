import "server-only";
import { randomBytes } from "node:crypto";

/**
 * DEMO payment gateway. Replace `charge` with Razorpay / Stripe / PhonePe etc.
 * when you have merchant keys. The rest of the checkout flow stays the same.
 * Test rule: a card number ending in 0000 is declined, anything else succeeds.
 */
export async function charge(args: { method: "upi" | "card"; amount: number; cardNumber?: string }) {
  await new Promise((r) => setTimeout(r, 600));
  if (args.method === "card" && args.cardNumber?.endsWith("0000")) {
    return { ok: false as const, message: "Card declined by bank (demo). Try another card or UPI." };
  }
  return { ok: true as const, ref: "DEMO-" + randomBytes(4).toString("hex").toUpperCase() };
}
