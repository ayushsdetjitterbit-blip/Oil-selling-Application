import type { Metadata } from "next";
export const metadata: Metadata = { title: "Contact & shipping" };

export default function Contact() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="font-serif text-4xl font-bold text-leaf-dark">Contact & shipping</h1>
      <div className="mt-6 space-y-5 text-bark/80">
        <p><b>Shipping.</b> We ship across India in 3 to 7 working days. Shipping is ₹60, and free on orders of ₹999 or more after discounts.</p>
        <p><b>Payment.</b> UPI, credit or debit card, or cash on delivery.</p>
        <p><b>Returns.</b> If a bottle arrives damaged or leaking, message us within 48 hours with your order ID and a photo, and we will replace it.</p>
        <p><b>Reach us.</b> Email hello@naturaloil.example · WhatsApp +91 00000 00000 (replace with your real details).</p>
      </div>
    </div>
  );
}
