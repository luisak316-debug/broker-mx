import { fmtPct } from '../../lib/format';

export function Change({ pct, abs }: { pct: number; abs?: number }) {
  const up = pct >= 0;
  return (
    <span className={up ? 'stat-up' : 'stat-down'}>
      {up ? '▲' : '▼'} {fmtPct(Math.abs(pct))}
      {abs !== undefined ? ` (${up ? '+' : '-'}${Math.abs(abs).toFixed(2)})` : ''}
    </span>
  );
}
