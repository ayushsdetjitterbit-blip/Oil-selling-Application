/** Animated top-down kolhu: a bullock walks the circle turning the beam; oil drips into a pot. */
export function Kolhu({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 400 400" className={className} role="img" aria-label="Animated wooden kolhu pressing oil">
      <defs>
        <radialGradient id="kground" cx=".5" cy=".5" r=".5"><stop offset="0" stopColor="#e9d6a6" /><stop offset="1" stopColor="#c9ad72" /></radialGradient>
        <radialGradient id="kwood" cx=".4" cy=".35" r=".7"><stop offset="0" stopColor="#a87442" /><stop offset="1" stopColor="#5a3a1c" /></radialGradient>
      </defs>
      <circle cx="200" cy="200" r="190" fill="url(#kground)" />
      <circle cx="200" cy="200" r="150" fill="none" stroke="#a8874a" strokeWidth="26" strokeOpacity=".35" strokeDasharray="4 10" />
      <g className="kolhu-spin">
        <rect x="196" y="48" width="8" height="152" rx="4" fill="#6b4523" />
        <g transform="translate(200 48)">
          <ellipse cx="0" cy="0" rx="26" ry="16" fill="#f4efe4" stroke="#3b2a17" strokeWidth="2" />
          <circle cx="-22" cy="-8" r="5" fill="#f4efe4" stroke="#3b2a17" strokeWidth="2" />
          <path d="M-26 -12 l-6 -6 M-26 -4 l-7 2" stroke="#3b2a17" strokeWidth="2" strokeLinecap="round" />
          <circle cx="6" cy="-3" r="4" fill="#3b2a17" opacity=".3" />
        </g>
      </g>
      <circle cx="200" cy="200" r="48" fill="url(#kwood)" stroke="#3b2a17" strokeWidth="3" />
      <circle cx="200" cy="200" r="30" fill="#2e1d0d" />
      <circle cx="200" cy="200" r="22" fill="#d9a21b" className="kolhu-shimmer" />
      <circle cx="200" cy="200" r="9" fill="#6b4523" />
      <g>
        <path d="M232 228 Q262 252 276 276" stroke="#6b4523" strokeWidth="6" fill="none" strokeLinecap="round" />
        <circle cx="278" cy="282" r="5" fill="#d9a21b" className="kolhu-drip" />
        <path d="M252 300 h52 l-6 40 q-20 10 -40 0 Z" fill="#b4532a" />
        <ellipse cx="278" cy="300" rx="26" ry="6" fill="#d9a21b" />
      </g>
    </svg>
  );
}
