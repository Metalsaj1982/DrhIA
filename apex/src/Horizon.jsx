import { useId } from 'react';

// El sol sube según el avance del día (ratio 0–1). Es el elemento central de la marca.
export default function Horizon({ ratio = 0, label, compact = false }) {
  const id = useId().replace(/:/g, '');
  const r = Math.max(0, Math.min(1, ratio));
  // y del centro del sol: 128 (oculto bajo el horizonte) → 52 (arriba).
  const sunY = 128 - r * 76;
  const warm = 0.25 + r * 0.75;
  return (
    <figure className={`horizon${compact ? ' horizon--compact' : ''}`} aria-label={label} role="img">
      <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <defs>
          <linearGradient id={`sky${id}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#24334A" />
            <stop offset="0.65" stopColor="#5D5A78" stopOpacity={1 - r * 0.4} />
            <stop offset="1" stopColor="#F2A65A" stopOpacity={warm} />
          </linearGradient>
          <radialGradient id={`glow${id}`} cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFD9A0" stopOpacity={0.9 * r} />
            <stop offset="1" stopColor="#FFD9A0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="320" height="160" fill={`url(#sky${id})`} />
        <g className="horizon-rise" style={{ transform: `translateY(${sunY - 128}px)` }}>
          <circle cx="160" cy="128" r="70" fill={`url(#glow${id})`} />
          <circle cx="160" cy="128" r="24" fill="#F4A340" />
        </g>
        {/* Cordillera: tres planos */}
        <path d="M0 118 L38 96 L64 108 L104 78 L138 102 L170 88 L206 110 L246 84 L282 104 L320 92 L320 160 L0 160Z" fill="#3E4A5C" />
        <path d="M0 128 L50 112 L92 124 L140 106 L188 124 L236 110 L280 122 L320 114 L320 160 L0 160Z" fill="#2B3644" />
        <path d="M0 140 L320 140 L320 160 L0 160Z" fill="#1F2A2E" />
      </svg>
      {label && <figcaption className="sr-only">{label}</figcaption>}
    </figure>
  );
}
