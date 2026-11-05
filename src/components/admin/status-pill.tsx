import { PAYMENT_LABEL, STATUS_LABEL, type OrderStatus, type PaymentStatus } from "@/lib/orders";

const STATUS_STYLE: Record<OrderStatus, [string, string]> = {
  awaiting_payment: ["bg-stone-100 text-stone-700", "⏳"],
  confirmed: ["bg-sky-50 text-sky-900", "✅"],
  packed: ["bg-violet-50 text-violet-900", "📦"],
  shipped: ["bg-amber-50 text-amber-900", "🚚"],
  delivered: ["bg-emerald-50 text-emerald-900", "🏡"],
  cancelled: ["bg-red-50 text-red-800", "✖"],
};

/** Order status with an icon and label, never colour alone. */
export function StatusPill({ status }: { status: OrderStatus }) {
  const [cls, icon] = STATUS_STYLE[status];
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ${cls}`}>
      <span aria-hidden>{icon}</span>{STATUS_LABEL[status]}
    </span>
  );
}

export function PaymentText({ status, method }: { status: PaymentStatus; method: string | null }) {
  const m = method ? ` · ${method === "cod" ? "COD" : method.toUpperCase()}` : "";
  const tone = status === "paid" ? "text-emerald-800" : status === "failed" ? "text-red-800" : status === "cod_due" ? "text-amber-900" : "text-bark/60";
  return <span className={`text-xs font-semibold ${tone}`}>{PAYMENT_LABEL[status]}{m}</span>;
}
