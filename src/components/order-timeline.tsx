import type { OrderEvent } from "@/lib/orders";
import { AlertIcon, CheckCircleIcon, ClipboardIcon, HomeIcon, PackageIcon, TruckIcon, XCircleIcon } from "./icons";

const LABEL: Record<string, string> = {
  placed: "Order placed",
  confirmed: "Order confirmed",
  packed: "Packed with care",
  shipped: "Out for shipping",
  delivered: "Delivered",
  cancelled: "Cancelled",
  payment_failed: "Payment attempt failed",
};
const I = "h-4 w-4";
const ICON: Record<string, React.ReactNode> = {
  placed: <ClipboardIcon className={I} />,
  confirmed: <CheckCircleIcon className={I} />,
  packed: <PackageIcon className={I} />,
  shipped: <TruckIcon className={I} />,
  delivered: <HomeIcon className={I} />,
  cancelled: <XCircleIcon className={I} />,
  payment_failed: <AlertIcon className={I} />,
};

export const when = (iso: string) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export function OrderTimeline({ events }: { events: OrderEvent[] }) {
  return (
    <ol className="relative ml-4 space-y-5 border-l-2 border-sand pl-7">
      {[...events].reverse().map((e, i) => (
        <li key={`${e.status}-${e.at}`} className={`relative ${i === 0 ? "rise" : ""}`}>
          <span aria-hidden className={`absolute -left-[45px] grid h-9 w-9 place-items-center rounded-full border-2 ${i === 0 ? "border-leaf bg-leaf/10 text-leaf" : "border-sand bg-paper text-bark/60"}`}>
            {ICON[e.status] ?? "•"}
          </span>
          <p className={`font-semibold ${i === 0 ? "text-leaf-dark" : ""}`}>{LABEL[e.status] ?? e.status}</p>
          <p className="text-xs text-bark/60">{when(e.at)}{e.note ? ` · ${e.note}` : ""}</p>
        </li>
      ))}
    </ol>
  );
}
