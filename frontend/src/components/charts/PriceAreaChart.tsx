import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { Candle } from '../../types';

export function PriceAreaChart({ candles }: { candles: Candle[] }) {
  const data = candles.map((c) => ({
    t: new Date(c.time * 1000).toLocaleDateString('es-MX', { month: 'short', day: '2-digit' }),
    close: c.close,
  }));
  const up = data.length > 1 && data[data.length - 1].close >= data[0].close;
  const color = up ? '#16a34a' : '#dc2626';

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis dataKey="t" tick={{ fill: '#94a3b8', fontSize: 11 }} minTickGap={28} />
        <YAxis
          domain={['auto', 'auto']}
          tick={{ fill: '#94a3b8', fontSize: 11 }}
          width={56}
          tickFormatter={(v) => Number(v).toLocaleString('es-MX')}
        />
        <Tooltip
          contentStyle={{ background: '#111a2e', border: '1px solid #26324f', borderRadius: 8, color: '#e5e9f0' }}
          labelStyle={{ color: '#94a3b8' }}
        />
        <Area type="monotone" dataKey="close" stroke={color} strokeWidth={2} fill="url(#g)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
