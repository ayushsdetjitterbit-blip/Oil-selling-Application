import { PAYMENT_LABEL, STATUS_LABEL, type OrderStatus, type PaymentStatus } from "@/lib/orders";
import { CheckCircleIcon, ClockIcon, HomeIcon, PackageIcon, TruckIcon, XCircleIcon } from "@/components/icons";

const I = "h-3.5 w-3.5";
const STATUS_STYLE: Record<OrderStatus, [string, React.ReactNode]> = {
  awaiting_payment: ["bg-stone-100 text-stone-700", <ClockIcon key="a" className={I} />],
  confirmed: ["bg-sky-50 text-sky-900", <CheckCircleIcon key="c" className={I} />],
  packed: ["bg-violet-50 text-violet-900", <PackageIcon key="p" className={I} />],
  shipped: ["bg-amber-50 text-amber-900", <TruckIcon key="s" className={I} />],
  delivered: ["bg-emerald-50 text-emerald-900", <HomeIcon key="d" className={I} />],
  cancelled: ["bg-red-50 text-red-800", <XCircleIcon key="x" className={I} />],
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
