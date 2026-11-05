import type { OrderStatus } from "@/lib/orders";

const STEPS: [OrderStatus, string][] = [
  ["confirmed", "Confirmed"],
  ["packed", "Packed"],
  ["shipped", "Shipped"],
  ["delivered", "Delivered"],
];

export function StatusSteps({ status }: { status: OrderStatus }) {
  const idx = STEPS.findIndex(([s]) => s === status);
  return (
    <ol className="flex items-center">
      {STEPS.map(([s, label], i) => (
        <li key={s} className="flex flex-1 flex-col items-center text-center text-xs">
          <span className={`grid h-8 w-8 place-items-center rounded-full font-bold ${i <= idx ? "bg-leaf text-white" : "bg-sand text-bark/50"}`}>{i <= idx ? "✓" : i + 1}</span>
          <span className="mt-1 font-semibold">{label}</span>
        </li>
      ))}
    </ol>
  );
}
