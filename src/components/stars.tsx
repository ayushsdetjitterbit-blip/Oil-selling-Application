/** Star rating with partial fill, e.g. 4.3 fills 86% of five stars. */
export function Stars({ value, className = "text-sm" }: { value: number; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span className={`relative inline-block leading-none tracking-[.1em] ${className}`} role="img" aria-label={`${value} out of 5 stars`}>
      <span aria-hidden className="text-sand">★★★★★</span>
      <span aria-hidden className="absolute inset-0 overflow-hidden whitespace-nowrap text-gold-dark" style={{ width: `${pct}%` }}>★★★★★</span>
    </span>
  );
}
