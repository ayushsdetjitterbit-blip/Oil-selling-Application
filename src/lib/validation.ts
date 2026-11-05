import { z } from "zod";

export const customerSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z
    .string()
    .trim()
    .transform((s) => s.replace(/[\s-]/g, "").replace(/^(\+91|91|0)(?=\d{10}$)/, ""))
    .pipe(z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit mobile number")),
  email: z.string().trim().email("Enter a valid email").max(120),
  address: z.string().trim().min(6, "Enter your full address").max(240),
  city: z.string().trim().min(2, "Enter your city").max(60),
  state: z.string().trim().min(2, "Enter your state").max(60),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a 6-digit pincode"),
});

export const createOrderSchema = z.object({
  customer: customerSchema,
  items: z
    .array(z.object({ variantId: z.string(), qty: z.number().int().min(1).max(20) }))
    .min(1, "Your cart is empty")
    .max(30),
  coupon: z.string().max(30).optional().nullable(),
});

export const paySchema = z.discriminatedUnion("method", [
  z.object({ method: z.literal("cod") }),
  z.object({
    method: z.literal("upi"),
    upiId: z.string().trim().regex(/^[\w.\-]{2,}@[a-zA-Z]{2,}$/, "Enter a valid UPI ID, e.g. name@upi"),
  }),
  z.object({
    method: z.literal("card"),
    number: z.string().transform((s) => s.replace(/\s/g, "")).pipe(z.string().regex(/^\d{16}$/, "Enter a 16-digit card number")),
    name: z.string().trim().min(2, "Enter the name on the card"),
    expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Use MM/YY"),
    cvv: z.string().regex(/^\d{3}$/, "3-digit CVV"),
  }),
]);

export const reviewSchema = z.object({
  orderId: z.string().trim().regex(/^NO-[0-9A-F]{10}$/, "Invalid order"),
  slug: z.string().trim().min(1).max(60),
  rating: z.coerce.number().int().min(1, "Choose a star rating").max(5),
  body: z.string().trim().min(10, "Please write at least a short sentence (10+ characters)").max(600, "Keep it under 600 characters"),
});

export const subscribeSchema = z.object({ email: z.string().trim().toLowerCase().email("Enter a valid email").max(120) });

export type CustomerInput = z.infer<typeof customerSchema>;
export type PayInput = z.infer<typeof paySchema>;
