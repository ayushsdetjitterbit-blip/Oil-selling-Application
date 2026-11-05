import type { OrderStatus } from "@/lib/orders";
import { CheckIcon, HomeIcon, PackageIcon, TruckIcon } from "./icons";

const I = "h-4 w-4";
const STEPS: [OrderStatus, string, React.ReactNode][] = [
  ["confirmed", "Confirmed", <CheckIcon key="c" className={I} />],
  ["packed", "Packed", <PackageIcon key="p" className={I} />],
  ["shipped", "Shipped", <TruckIcon key="s" className={I} />],
  ["delivered", "Delivered", <HomeIcon key="d" className={I} />],
];

/** Progress bar across the four delivery steps; the filled line animates to the current step. */
export function StatusSteps({ status }: { status: OrderStatus }) {
  if (status === "cancelled") {
    return <p className="rounded-xl bg-red-50 p-3 text-center text-sm font-semibold text-red-800">This order was cancelled.</p>;
  }
  const idx = STEPS.findIndex(([s]) => s === status);
  const pct = idx <= 0 ? 0 : (idx / (STEPS.length - 1)) * 100;
  return (
    <div className="relative px-4">
      <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-4 h-1 rounded-full bg-sand">
        <div className="progress-fill h-full rounded-full bg-gradient-to-r from-gold to-leaf" style={{ width: `${pct}%` }} />
      </div>
      <ol className="relative flex" aria-label={`Order status: ${STEPS[idx]?.[1] ?? "awaiting payment"}`}>
        {STEPS.map(([s, label, icon], i) => {
          const done = i <= idx;
          const current = i === idx;
          return (
            <li key={s} className="flex flex-1 flex-col items-center text-center text-xs" aria-current={current ? "step" : undefined}>
              <span className={`relative grid h-9 w-9 place-items-center rounded-full text-sm font-bold transition ${done ? "bg-leaf text-white shadow-md" : "bg-sand text-bark/50"}`}>
                {current && <span aria-hidden className="absolute inset-0 animate-ping rounded-full bg-leaf/40" />}
                <span className="relative">{done ? icon : i + 1}</span>
              </span>
              <span className={`mt-2 font-semibold ${done ? "text-leaf-dark" : "text-bark/50"}`}>{label}</span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
