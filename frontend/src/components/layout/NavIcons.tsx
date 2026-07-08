import type { ReactElement } from 'react';

type IconProps = {
  className?: string;
};

const base = 'nav-icon';

export function NavIconDashboard({ className = '' }: IconProps) {
  return (
    <svg className={`${base} ${className}`} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

export function NavIconStocks({ className = '' }: IconProps) {
  return (
    <svg className={`${base} ${className}`} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M3 14.5L8 9.5L11.5 13L17 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M14 6.5H17V9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function NavIconCommodities({ className = '' }: IconProps) {
  return (
    <svg className={`${base} ${className}`} viewBox="0 0 20 20" fill="none" aria-hidden>
      <ellipse cx="10" cy="13" rx="6.5" ry="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M5.5 13V8.5C5.5 6.5 7.5 5 10 5C12.5 5 14.5 6.5 14.5 8.5V13"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path d="M10 5V3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function NavIconForex({ className = '' }: IconProps) {
  return (
    <svg className={`${base} ${className}`} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M6 7H14M6 13H14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M11 5L14 7L11 9M9 11L6 13L9 15"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function NavIconCrypto({ className = '' }: IconProps) {
  return (
    <svg className={`${base} ${className}`} viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="6.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 7.5H11C12.1 7.5 13 8.2 13 9.25C13 10.3 12.1 11 11 11H9V12.5M9 6.5V7.5M9 11V12.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function NavIconFund({ className = '' }: IconProps) {
  return (
    <svg className={`${base} ${className}`} viewBox="0 0 20 20" fill="none" aria-hidden>
      <rect x="3" y="5" width="14" height="11" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 8.5H17" stroke="currentColor" strokeWidth="1.4" />
      <path d="M7 12H9.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export function NavIconInvestment({ className = '' }: IconProps) {
  return (
    <svg className={`${base} ${className}`} viewBox="0 0 20 20" fill="none" aria-hidden>
      <path
        d="M4 15L8 10L11 12.5L16 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  );
}

export type NavIconId =
  | 'dashboard'
  | 'stocks'
  | 'commodities'
  | 'forex'
  | 'crypto'
  | 'fund'
  | 'investment';

const MAP: Record<NavIconId, (props: IconProps) => ReactElement> = {
  dashboard: NavIconDashboard,
  stocks: NavIconStocks,
  commodities: NavIconCommodities,
  forex: NavIconForex,
  crypto: NavIconCrypto,
  fund: NavIconFund,
  investment: NavIconInvestment,
};

export function NavIcon({ id, className = '' }: { id: NavIconId; className?: string }) {
  const Cmp = MAP[id];
  return <Cmp className={className} />;
}
