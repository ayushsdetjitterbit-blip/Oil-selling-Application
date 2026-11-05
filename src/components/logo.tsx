/** Brand mark: a drop of oil inside a ring, in the theme's accent colours. */
export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden>
      <circle cx="20" cy="20" r="19" style={{ fill: "var(--color-leaf-dark)" }} />
      <circle cx="20" cy="20" r="15.5" fill="none" strokeWidth="1" strokeDasharray="1.5 2.5" style={{ stroke: "var(--color-gold)" }} opacity=".7" />
      <path d="M20 9c-1 4-6.5 8.5-6.5 13.5a6.5 6.5 0 0 0 13 0C26.5 17.5 21 13 20 9Z" style={{ fill: "var(--color-gold)" }} />
      <path d="M17.2 23.5a3 3 0 0 0 2.3 2.9" fill="none" stroke="#fff" strokeOpacity=".75" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
