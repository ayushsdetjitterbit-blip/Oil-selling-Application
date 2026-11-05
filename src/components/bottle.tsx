export function Bottle({ color, className = "" }: { color: string; className?: string }) {
  return (
    <svg viewBox="0 0 120 200" className={className} role="img" aria-label="Oil bottle">
      <rect x="46" y="6" width="28" height="22" rx="4" fill="#6b4a2b" />
      <rect x="50" y="28" width="20" height="18" fill="#e8dcc0" opacity=".8" />
      <path d="M50 44 C50 58 18 66 18 96 L18 176 Q18 190 32 190 L88 190 Q102 190 102 176 L102 96 C102 66 70 58 70 44 Z" fill="#f4ecd6" stroke="#cdbf9b" strokeWidth="2" />
      <path d="M22 110 L98 110 L98 176 Q98 186 88 186 L32 186 Q22 186 22 176 Z" fill={color} />
      <path d="M22 110 Q41 102 60 110 T98 110" fill="none" stroke="#fff" strokeOpacity=".4" strokeWidth="3" />
      <rect x="30" y="122" width="60" height="48" rx="6" fill="#fffaf0" opacity=".95" />
      <text x="60" y="142" textAnchor="middle" fontSize="9" fontWeight="700" fill="#3c4a1f" fontFamily="serif">NATURAL</text>
      <text x="60" y="155" textAnchor="middle" fontSize="9" fontWeight="700" fill="#3c4a1f" fontFamily="serif">OIL</text>
      <text x="60" y="165" textAnchor="middle" fontSize="5.5" fill="#7a5a2b">KOLHU PRESSED</text>
    </svg>
  );
}
