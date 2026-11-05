import { useId } from "react";

/**
 * Glass bottle illustration. `level` (0–1) sets how full it is; changing it
 * animates the oil rising or falling.
 */
export function Bottle({ color, className = "", level = 0.72, style }: { color: string; className?: string; level?: number; style?: React.CSSProperties }) {
  const id = useId().replace(/:/g, "");
  const shift = (0.72 - Math.max(0, Math.min(1, level))) * 130;
  return (
    <svg viewBox="0 0 120 210" className={className} role="img" aria-label="Bottle of natural oil"
      style={{ filter: "drop-shadow(0 18px 18px rgba(59,42,23,.25))", ...style }}>
      <defs>
        <linearGradient id={`oil${id}`} x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity=".78" />
          <stop offset=".45" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity=".72" />
        </linearGradient>
        <linearGradient id={`gl${id}`} x1="0" x2="1">
          <stop offset="0" stopColor="#fff" stopOpacity=".55" />
          <stop offset=".25" stopColor="#fff" stopOpacity=".05" />
          <stop offset=".8" stopColor="#fff" stopOpacity=".0" />
          <stop offset="1" stopColor="#fff" stopOpacity=".35" />
        </linearGradient>
        <linearGradient id={`cap${id}`} x1="0" x2="1"><stop offset="0" stopColor="#5a3d22" /><stop offset=".5" stopColor="#8a6238" /><stop offset="1" stopColor="#4a3119" /></linearGradient>
        <clipPath id={`in${id}`}>
          <path d="M53 34 H67 V46 C67 61 101 70 101 100 V186 Q101 199 88 199 H32 Q19 199 19 186 V100 C19 70 53 61 53 46 Z" />
        </clipPath>
      </defs>
      <rect x="44" y="4" width="32" height="26" rx="5" fill={`url(#cap${id})`} />
      {[10, 15, 20, 25].map((y) => <line key={y} x1="44" x2="76" y1={y} y2={y} stroke="#00000022" />)}
      <path d="M50 30 H70 V46 C70 60 104 68 104 100 V186 Q104 202 88 202 H32 Q16 202 16 186 V100 C16 68 50 60 50 46 Z" fill="#fff8e6" fillOpacity=".55" stroke="#cdbf9b" strokeWidth="2" />
      <g clipPath={`url(#in${id})`}>
        <g style={{ transform: `translateY(${shift}px)`, transition: "transform .9s cubic-bezier(.2,.8,.2,1)" }}>
          <path d="M0 106 Q30 98 60 106 T120 106 V340 H0 Z" fill={`url(#oil${id})`} />
          <path d="M0 106 Q30 98 60 106 T120 106" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="2.5" />
        </g>
      </g>
      <rect x="27" y="124" width="66" height="56" rx="7" fill="#fffaf0" />
      <rect x="27" y="124" width="66" height="56" rx="7" fill="none" stroke="#4a5d23" strokeOpacity=".35" />
      <text x="60" y="142" textAnchor="middle" fontSize="10" fontWeight="800" fill="#26320f" fontFamily="Georgia,serif" letterSpacing="1">NATURAL</text>
      <text x="60" y="154" textAnchor="middle" fontSize="10" fontWeight="800" fill="#26320f" fontFamily="Georgia,serif" letterSpacing="3">OIL</text>
      <line x1="40" x2="80" y1="160" y2="160" stroke="#e0a81c" strokeWidth="1.5" />
      <text x="60" y="171" textAnchor="middle" fontSize="5.5" fill="#7a5a2b" letterSpacing="1">KOLHU PRESSED</text>
      <path d="M22 70 C26 90 22 130 24 190 L30 190 C28 130 32 90 28 66 Z" fill={`url(#gl${id})`} />
      <path d="M92 110 L96 190 L90 190 Z" fill="#fff" fillOpacity=".25" />
    </svg>
  );
}
