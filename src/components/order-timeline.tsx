import type { OrderEvent } from "@/lib/orders";

const LABEL: Record<string, string> = {
  placed: "Order placed",
  confirmed: "Order confirmed",
  packed: "Packed with care",
  shipped: "Out for shipping",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_failed: "Payment attempt failed",
};
const ICON: Record<string, string> = { placed: "📝", confirmed: "✅", packed: "📦", shipped: "🚚", delivered: "🏡", cancelled: "✖", payment_failed: "⚠" };

export const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export function OrderTimeline({ events }: { events: OrderEvent[] }) {
  return (
    <ol className="relative ml-4 space-y-5 border-l-2 border-sand pl-7">
      {[...events].reverse().map((e, i) => (
        <li key={`${e.status}-${e.at}`} className={`relative ${i === 0 ? "rise" : ""}`}>
          <span aria-hidden className={`absolute -left-[45px] grid h-9 w-9 place-items-center rounded-full border-2 text-sm ${i === 0 ? "border-leaf bg-leaf/10" : "border-sand bg-paper"}`}>
            {ICON[e.status] ?? "•"}
          </span>
          <p className={`font-semibold ${i === 0 ? "text-leaf-dark" : ""}`}>{LABEL[e.status] ?? e.status}</p>
          <p className="text-xs text-bark/60">{when(e.at)}{e.note ? ` · ${e.note}` : ""}</p>
        </li>
      ))}
    </ol>
  );
}
