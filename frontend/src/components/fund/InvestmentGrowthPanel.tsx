import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { TooltipProps } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { api } from '../../api/client';
import { useClientAuth } from '../../auth/ClientAuthContext';
import { Card } from '../common/Card';
import { useClientMoney } from '../../lib/clientMoney';
import { INVESTMENT_READY_EVENT } from '../../lib/investmentScroll';
import type { AssetClass, PortfolioSummary, Position } from '../../types';

type ChartPoint = {
  label: string;
  value: number;
  ts: number;
};

const ASSET_META: Record<
  AssetClass,
  { label: string; color: string; route: string }
> = {
  forex: { label: 'Divisas (Forex)', color: '#7A9E8E', route: '/app/forex' },
  commodity: { label: 'Materias Primas', color: '#C9A962', route: '/app/commodities' },
  stock: { label: 'Acciones', color: '#8BA4C7', route: '/app/acciones' },
  index: { label: 'Índices Bursátiles', color: '#6B9EAD', route: '/app/indices' },
  crypto: { label: 'Criptomonedas', color: '#9B8BB8', route: '/app/cripto' },
};

const CHART_UP = '#C9A962';
const CHART_DOWN = '#9B6B6B';

function PremiumChartTooltip({
  active,
  payload,
  label,
}: TooltipProps<ValueType, NameType>) {
  const { format: formatMoney } = useClientMoney();
  if (!active || !payload?.length) return null;
  const value = Number(payload[0]?.value ?? 0);
  return (
    <div className="investment-panel__tooltip">
      <p className="investment-panel__tooltip-label">{label}</p>
      <p className="investment-panel__tooltip-value">{formatMoney(value)}</p>
    </div>
  );
}

const MAX_POINTS = 36;
const POLL_MS = 5_000;

function portfolioValue(portfolio: PortfolioSummary): number {
  const unrealized = portfolio.positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
  return portfolio.cashMxn + portfolio.equityExposureMxn + unrealized;
}

function investedAmount(portfolio: PortfolioSummary): number {
  return portfolio.equityExposureMxn;
}

function unrealizedTotal(portfolio: PortfolioSummary): number {
  return portfolio.positions.reduce((sum, p) => sum + p.unrealizedPnl, 0);
}

function formatTick(ts: number): string {
  return new Date(ts).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
}

function seedHistory(current: number): ChartPoint[] {
  const now = Date.now();
  const points: ChartPoint[] = [];
  let value = current * 0.9;

  for (let i = MAX_POINTS - 1; i >= 0; i -= 1) {
    const ts = now - i * 60_000;
    const drift = (current - value) * 0.12;
    const noise = current * 0.0015 * (Math.random() - 0.5);
    value = Math.max(0, value + drift + noise);
    points.push({ label: formatTick(ts), value: Number(value.toFixed(2)), ts });
  }

  points[points.length - 1] = {
    label: formatTick(now),
    value: Number(current.toFixed(2)),
    ts: now,
  };

  return points;
}

function appendPoint(prev: ChartPoint[], value: number): ChartPoint[] {
  const ts = Date.now();
  const next = [...prev, { label: formatTick(ts), value: Number(value.toFixed(2)), ts }];
  return next.length > MAX_POINTS ? next.slice(-MAX_POINTS) : next;
}

function groupByAsset(positions: Position[]) {
  const map = new Map<AssetClass, { exposure: number; pnl: number; count: number }>();

  for (const pos of positions) {
    const key = pos.assetClass ?? 'stock';
    const row = map.get(key) ?? { exposure: 0, pnl: 0, count: 0 };
    row.exposure += pos.notionalMxn;
    row.pnl += pos.unrealizedPnl;
    row.count += 1;
    map.set(key, row);
  }

  return Array.from(map.entries()).map(([assetClass, data]) => ({
    assetClass,
    ...ASSET_META[assetClass],
    ...data,
  }));
}

export function InvestmentGrowthPanel() {
  const { client } = useClientAuth();
  const clientId = client?.id;
  const areaGradientId = useId().replace(/:/g, '');

  const [portfolio, setPortfolio] = useState<PortfolioSummary | null>(null);
  const { format: formatMoney } = useClientMoney(portfolio?.currency);
  const [history, setHistory] = useState<ChartPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const seeded = useRef(false);

  const refresh = useCallback(async () => {
    if (!clientId) return;
    try {
      const data = await api.portfolio(clientId);
      setPortfolio(data);
      setError(null);
      const total = portfolioValue(data);

      setHistory((prev) => {
        if (!seeded.current) {
          seeded.current = true;
          return seedHistory(total);
        }
        if (prev.length === 0) return seedHistory(total);
        return appendPoint(prev, total);
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar tu portafolio.');
    } finally {
      setLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;
    seeded.current = false;
    setLoading(true);
    void refresh();
    const id = window.setInterval(() => void refresh(), POLL_MS);

    const onBalance = () => void refresh();
    window.addEventListener('brokermx:balance-updated', onBalance);

    return () => {
      window.clearInterval(id);
      window.removeEventListener('brokermx:balance-updated', onBalance);
    };
  }, [clientId, refresh]);

  useEffect(() => {
    if (loading) return;
    window.dispatchEvent(new CustomEvent(INVESTMENT_READY_EVENT));
  }, [loading]);

  const total = portfolio ? portfolioValue(portfolio) : 0;
  const invested = portfolio ? investedAmount(portfolio) : 0;
  const pnl = portfolio ? unrealizedTotal(portfolio) : 0;
  const cash = portfolio?.cashMxn ?? 0;
  const segments = useMemo(() => groupByAsset(portfolio?.positions ?? []), [portfolio?.positions]);

  const chartUp = history.length > 1 && history[history.length - 1].value >= history[0].value;
  const stroke = chartUp ? CHART_UP : CHART_DOWN;

  const yDomain = useMemo((): [number, number] => {
    if (history.length === 0) return [0, 1];
    const values = history.map((h) => h.value);
    let min = Math.min(...values);
    let max = Math.max(...values);
    if (max === 0 && min === 0) return [0, 1];
    const span = max - min;
    const pad = Math.max(span * 0.14, max * 0.01, 1);
    min = Math.max(0, min - pad);
    max += pad;
    return [min, max];
  }, [history]);

  const changePct =
    history.length > 1 && history[0].value > 0
      ? ((history[history.length - 1].value - history[0].value) / history[0].value) * 100
      : 0;

  return (
    <Card title="Mi panel de inversión" className="investment-panel-card">
      <p className="mb-4 text-sm text-slate-400">
        Visualiza cómo evoluciona tu patrimonio, en qué mercados participas y el rendimiento de tus
        posiciones en tiempo real.
      </p>

      {error && <p className="mb-3 text-sm text-bear">{error}</p>}

      <div className={`investment-panel__body${loading && !portfolio ? ' investment-panel__body--loading' : ''}`}>
        <div className="investment-panel__stats">
            <div className="investment-panel__stat investment-panel__stat--primary">
              <p className="investment-panel__stat-label">Patrimonio total</p>
              <p className="investment-panel__stat-value">{loading && !portfolio ? '—' : formatMoney(total)}</p>
              <p
                className={`investment-panel__stat-change ${
                  changePct >= 0 ? 'investment-panel__trend--up' : 'investment-panel__trend--down'
                }`}
              >
                {changePct >= 0 ? '▲' : '▼'} {Math.abs(changePct).toFixed(2)}% en la sesión
              </p>
            </div>
            <div className="investment-panel__stat">
              <p className="investment-panel__stat-label">Invertido en mercado</p>
              <p className="investment-panel__stat-value investment-panel__stat-value--sm">
                {loading && !portfolio ? '—' : formatMoney(invested)}
              </p>
            </div>
            <div className="investment-panel__stat">
              <p className="investment-panel__stat-label">Saldo disponible</p>
              <p className="investment-panel__stat-value investment-panel__stat-value--sm">
                {loading && !portfolio ? '—' : formatMoney(cash)}
              </p>
            </div>
            <div className="investment-panel__stat">
              <p className="investment-panel__stat-label">Ganancia / pérdida no realizada</p>
              <p
                className={`investment-panel__stat-value investment-panel__stat-value--sm ${
                  pnl >= 0 ? 'investment-panel__trend--up' : 'investment-panel__trend--down'
                }`}
              >
                {loading && !portfolio ? '—' : `${pnl >= 0 ? '+' : ''}${formatMoney(pnl)}`}
              </p>
            </div>
          </div>

          <div className="investment-panel__chart-wrap">
            <div className="investment-panel__chart-header">
              <p className="investment-panel__chart-title">Evolución del patrimonio</p>
              <span className="investment-panel__live-badge">En vivo</span>
            </div>
            <div className="investment-panel__chart">
              {loading && !portfolio ? (
                <div className="investment-panel__chart-skeleton" aria-hidden />
              ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history} margin={{ top: 12, right: 12, left: 4, bottom: 4 }}>
                  <defs>
                    <linearGradient id={areaGradientId} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={stroke} stopOpacity={0.42} />
                      <stop offset="55%" stopColor={stroke} stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#000000" stopOpacity={0} />
                    </linearGradient>
                    <filter id={`${areaGradientId}-glow`}>
                      <feGaussianBlur stdDeviation="2" result="blur" />
                      <feMerge>
                        <feMergeNode in="blur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <CartesianGrid
                    stroke="rgba(255,255,255,0.05)"
                    vertical={false}
                    strokeDasharray="3 6"
                  />
                  <XAxis
                    dataKey="label"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 500 }}
                    minTickGap={28}
                    interval="preserveStartEnd"
                  />
                  <YAxis
                    domain={yDomain}
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#6B7280', fontSize: 10, fontWeight: 500 }}
                    width={62}
                    tickFormatter={(v) =>
                      Number(v).toLocaleString('es-MX', {
                        notation: 'compact',
                        maximumFractionDigits: 1,
                      })
                    }
                  />
                  <Tooltip
                    content={<PremiumChartTooltip />}
                    cursor={{
                      stroke: 'rgba(201, 169, 98, 0.35)',
                      strokeWidth: 1,
                      strokeDasharray: '4 4',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke={stroke}
                    strokeWidth={2}
                    fill={`url(#${areaGradientId})`}
                    filter={`url(#${areaGradientId}-glow)`}
                    isAnimationActive={false}
                    dot={false}
                    activeDot={{
                      r: 4,
                      fill: stroke,
                      stroke: '#F5F0E6',
                      strokeWidth: 1.5,
                    }}
                  />
                </AreaChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

          {!loading || portfolio ? (
          <div className="mt-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Dónde está invertido tu capital
            </p>

            {segments.length === 0 ? (
              <div className="rounded-xl border border-ink-600 bg-ink-900/50 px-4 py-5 text-sm text-slate-400">
                Aún no tienes posiciones abiertas. Cuando tu asesor acredite tu depósito y comiences
                a operar en Divisas, Materias Primas, Acciones, Índices o Cripto, verás aquí la
                distribución y el
                rendimiento por mercado.
                <div className="mt-4 flex flex-wrap gap-2">
                  {Object.values(ASSET_META).map((m) => (
                    <Link key={m.route} to={m.route} className="btn-ghost px-3 py-1.5 text-xs">
                      Explorar {m.label}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {segments.map((seg) => {
                  const share = invested > 0 ? (seg.exposure / invested) * 100 : 0;
                  return (
                    <div key={seg.assetClass} className="investment-panel__segment">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium text-white">{seg.label}</p>
                          <p className="text-xs text-slate-500">
                            {seg.count} posición{seg.count === 1 ? '' : 'es'} · {share.toFixed(1)}% del
                            capital invertido
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-white">{formatMoney(seg.exposure)}</p>
                          <p
                            className={`text-xs ${
                              seg.pnl >= 0
                                ? 'investment-panel__trend--up'
                                : 'investment-panel__trend--down'
                            }`}
                          >
                            {seg.pnl >= 0 ? '+' : ''}
                            {formatMoney(seg.pnl)} no realizado
                          </p>
                        </div>
                      </div>
                      <div className="investment-panel__segment-bar">
                        <span
                          className="investment-panel__segment-fill"
                          style={{ width: `${Math.min(100, share)}%`, backgroundColor: seg.color }}
                        />
                      </div>
                      <Link to={seg.route} className="text-xs text-brand-300 hover:underline">
                        Ver módulo →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          ) : null}
      </div>
    </Card>
  );
}
