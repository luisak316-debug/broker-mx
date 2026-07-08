import type { DepositMethod } from '../../lib/depositMethods';

type Props = {
  method: DepositMethod;
  className?: string;
};

export function DepositMethodIcon({ method, className = '' }: Props) {
  const cls = `deposit-method-icon ${className}`.trim();

  switch (method) {
    case 'TRANSFERENCIA':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M3 7H17V15C17 15.55 16.55 16 16 16H4C3.45 16 3 15.55 3 15V7Z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path d="M3 9H17" stroke="currentColor" strokeWidth="1.4" />
          <path d="M7 12H11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'TARJETA':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <rect x="2" y="5" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2 8.5H18" stroke="currentColor" strokeWidth="1.4" />
          <path d="M5 12.5H8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'VENTANILLA':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path d="M4 16V6L10 3L16 6V16" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M7 16V11H13V16" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          <path d="M4 16H16" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case 'OXXO':
      return (
        <svg className={cls} viewBox="0 0 20 20" fill="none" aria-hidden>
          <path
            d="M4 6H16V14C16 14.55 15.55 15 15 15H5C4.45 15 4 14.55 4 14V6Z"
            stroke="currentColor"
            strokeWidth="1.4"
          />
          <path d="M7 9H13" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          <path d="M10 7V11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}
