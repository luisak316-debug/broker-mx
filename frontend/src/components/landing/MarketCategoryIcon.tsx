import type { MarketCategoryId } from '../../data/marketCategories';

type Props = {
  id: MarketCategoryId;
  className?: string;
};

const ICON_FONT = "system-ui, -apple-system, 'Segoe UI', sans-serif";

export function MarketCategoryIcon({ id, className = 'h-10 w-10' }: Props) {
  switch (id) {
    case 'stocks':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
          <path
            d="M8 36V18L24 9L40 18V36"
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M13 36V23M19 36V20M29 36V20M35 36V23" stroke="#64748b" strokeWidth="1.25" />
          <path d="M11 18L24 11L37 18" stroke="#cbd5e1" strokeWidth="1.25" strokeLinecap="round" />
          <path d="M8 36H40" stroke="#475569" strokeWidth="1.5" strokeLinecap="round" />
          <path
            d="M14 28L22 24L30 26L36 18"
            stroke="#38bdf8"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.85"
          />
        </svg>
      );
    case 'commodities':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
          <rect
            x="9"
            y="11"
            width="30"
            height="22"
            rx="2"
            stroke="#b8860b"
            strokeWidth="1.25"
            fill="rgba(184,134,11,0.06)"
          />
          <path d="M9 15H39" stroke="#b8860b" strokeWidth="0.75" opacity="0.45" />
          <text
            x="24"
            y="26"
            textAnchor="middle"
            fill="#d4af37"
            fontSize="10"
            fontWeight="600"
            fontFamily={ICON_FONT}
            letterSpacing="0.14em"
          >
            PMX
          </text>
          <rect x="16" y="33" width="16" height="3" rx="0.5" fill="#b8860b" opacity="0.35" />
          <path
            d="M18 38H30"
            stroke="#64748b"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.5"
          />
        </svg>
      );
    case 'forex':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
          <rect x="6" y="12" width="11" height="24" rx="2" stroke="#64748b" strokeWidth="1.15" />
          <rect x="18.5" y="8" width="11" height="28" rx="2" stroke="#64748b" strokeWidth="1.15" />
          <rect x="31" y="14" width="11" height="22" rx="2" stroke="#64748b" strokeWidth="1.15" />
          <text
            x="11.5"
            y="26"
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="6.5"
            fontWeight="600"
            fontFamily={ICON_FONT}
            letterSpacing="0.04em"
          >
            USD
          </text>
          <text
            x="24"
            y="24"
            textAnchor="middle"
            fill="#e2e8f0"
            fontSize="6.5"
            fontWeight="600"
            fontFamily={ICON_FONT}
            letterSpacing="0.04em"
          >
            EUR
          </text>
          <text
            x="36.5"
            y="27"
            textAnchor="middle"
            fill="#cbd5e1"
            fontSize="6.5"
            fontWeight="600"
            fontFamily={ICON_FONT}
            letterSpacing="0.04em"
          >
            MXN
          </text>
          <path
            d="M17 24H18.5M29.5 22H31"
            stroke="#475569"
            strokeWidth="1"
            strokeLinecap="round"
            opacity="0.6"
          />
        </svg>
      );
    case 'crypto':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
          <circle cx="24" cy="24" r="15" stroke="#F7931A" strokeWidth="1.25" opacity="0.35" />
          <circle cx="24" cy="24" r="12" fill="#F7931A" fillOpacity="0.1" />
          <path
            d="M27.2 15.2V17.1H29.5C30.8 17.1 31.6 17.8 31.6 18.9C31.6 20 30.8 20.7 29.5 20.7H27.2V15.2ZM27.2 22.6V25H30.1C31.5 25 32.4 25.8 32.4 27C32.4 28.2 31.5 29 30.1 29H27.2V22.6ZM25.2 13H29.8C32.6 13 34.5 14.5 34.5 17C34.5 18.7 33.5 19.9 32 20.4C33.6 20.9 34.7 22.2 34.7 24.1C34.7 26.7 32.6 28.5 29.2 28.5H25.2V13Z"
            fill="#F7931A"
          />
          <path
            d="M22.2 15.2H20.2V17.1H22.2V15.2ZM20.2 18.9V20.7H22.2V18.9H20.2ZM20.2 22.6V29H22.2V22.6H20.2Z"
            fill="#F7931A"
          />
        </svg>
      );
    case 'indexes':
      return (
        <svg viewBox="0 0 48 48" className={className} fill="none" aria-hidden>
          <rect x="8" y="10" width="32" height="26" rx="2" stroke="#64748b" strokeWidth="1.25" />
          <path
            d="M12 30L18 24L24 27L32 16L36 20"
            stroke="#22d3ee"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M12 34H36" stroke="#475569" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
  }
}
