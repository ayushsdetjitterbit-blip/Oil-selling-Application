import { LOW_STOCK, type Size } from "@/lib/products";

/** Live stock state. Shows nothing when stock isn't tracked; `quiet` hides the plain "In stock" state. */
export function StockBadge({ size, quiet = false }: { size: Size; quiet?: boolean }) {
  if (size.stock == null) return null;
  if (size.stock <= 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-800">
        <span aria-hidden className="h-2 w-2 rounded-full bg-red-600" /> Sold out
      </span>
    );
  }
  if (size.stock <= LOW_STOCK) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900">
        <span aria-hidden className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-600" />
        </span>
        Only {size.stock} left
      </span>
    );
  }
  if (quiet) return null;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
      <span aria-hidden className="h-2 w-2 rounded-full bg-emerald-600" /> In stock
    </span>
  );
}
