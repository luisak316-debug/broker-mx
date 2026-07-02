import type { MarketCategoryId } from '../../data/marketCategories';

type Props = {
  id: MarketCategoryId;
  className?: string;
};

export function MarketCategoryIcon({ id, className = 'h-10 w-10' }: Props) {
  switch (id) {
    case 'stocks':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden>
          <defs>
            <linearGradient id="mc-stocks" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="50%" stopColor="#6366f1" />
              <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="40" height="40" rx="12" fill="url(#mc-stocks)" opacity="0.2" />
          <path
            d="M10 32 L18 24 L26 28 L38 14"
            fill="none"
            stroke="url(#mc-stocks)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="38" cy="14" r="3" fill="#22d3ee" />
          <rect x="12" y="30" width="4" height="8" rx="1" fill="#6366f1" opacity="0.9" />
          <rect x="20" y="26" width="4" height="12" rx="1" fill="#0ea5e9" opacity="0.9" />
          <rect x="28" y="22" width="4" height="16" rx="1" fill="#22d3ee" opacity="0.9" />
        </svg>
      );
    case 'commodities':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden>
          <defs>
            <linearGradient id="mc-commodities" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="45%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="mc-oil" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          <ellipse cx="24" cy="36" rx="14" ry="4" fill="#f59e0b" opacity="0.25" />
          <path
            d="M14 18 L34 18 L32 30 C32 33 28 36 24 36 C20 36 16 33 16 30 Z"
            fill="url(#mc-commodities)"
          />
          <path d="M22 10 C22 10 24 14 24 18 L24 18 C24 14 26 10 26 10" fill="url(#mc-oil)" />
          <rect x="18" y="22" width="12" height="2" rx="1" fill="#fef3c7" opacity="0.6" />
        </svg>
      );
    case 'forex':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden>
          <defs>
            <linearGradient id="mc-forex" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="50%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
          </defs>
          <circle cx="18" cy="24" r="12" fill="url(#mc-forex)" opacity="0.25" />
          <circle cx="30" cy="24" r="12" fill="url(#mc-forex)" opacity="0.35" />
          <text x="18" y="28" textAnchor="middle" fill="#ecfdf5" fontSize="11" fontWeight="700">
            $
          </text>
          <text x="30" y="28" textAnchor="middle" fill="#ecfdf5" fontSize="10" fontWeight="700">
            €
          </text>
          <path
            d="M22 14 C28 18 28 30 22 34"
            fill="none"
            stroke="#6ee7b7"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d="M26 14 C20 18 20 30 26 34"
            fill="none"
            stroke="#34d399"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
      );
    case 'crypto':
      return (
        <svg viewBox="0 0 48 48" className={className} aria-hidden>
          <defs>
            <linearGradient id="mc-crypto" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316" />
              <stop offset="50%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#a855f7" />
            </linearGradient>
          </defs>
          <path
            d="M24 4 L38 12 V28 L24 36 L10 28 V12 Z"
            fill="url(#mc-crypto)"
            opacity="0.35"
          />
          <path
            d="M24 8 L34 14 V26 L24 32 L14 26 V14 Z"
            fill="url(#mc-crypto)"
          />
          <path
            d="M28 18 H26 V16 H22 V18 H20 V20 H22 V24 C22 25.1 22.9 26 24 26 H26 V28 H22 V30 H26 V32 H30 V30 H32 V28 H30 V24 C30 22.9 29.1 22 28 22 H26 V18 H28 Z"
            fill="#fff7ed"
          />
        </svg>
      );
  }
}
