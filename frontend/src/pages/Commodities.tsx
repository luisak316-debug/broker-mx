import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useLivePrices } from '../hooks/useLivePrices';
import { Card } from '../components/common/Card';
import { QuoteTable } from '../components/common/QuoteTable';
import { InstrumentDetail } from '../components/trading/InstrumentDetail';
import type { CommodityAlert, Instrument } from '../types';

const GROUPS = [
  { id: 'metals', label: 'Metales' },
  { id: 'energy', label: 'Energía' },
  { id: 'agricultural', label: 'Agrícolas' },
] as const;

type GroupId = (typeof GROUPS)[number]['id'];

export function Commodities() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [group, setGroup] = useState<GroupId>('metals');
  const [selected, setSelected] = useState<string>('XAU');
  const [alerts, setAlerts] = useState<CommodityAlert[]>([]);
  const { quotes } = useLivePrices();

  useEffect(() => {
    api.instruments('commodity').then(setInstruments);
  }, []);

  useEffect(() => {
    const load = () => api.commodityAlerts(1.5).then(setAlerts).catch(() => setAlerts([]));
    load();
    const id = setInterval(load, 5000);
    return () => clearInterval(id);
  }, []);

  const filtered = instruments.filter((i) => (i.meta?.group as string) === group);
  const current = instruments.find((i) => i.symbol === selected);
  const triggered = alerts.filter((a) => a.triggered);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Materias Primas · Commodities</h1>
        <p className="text-sm text-slate-400">
          Cotizaciones basadas en contratos de futuros y alertas de alta volatilidad.
        </p>
      </header>

      {triggered.length > 0 && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 text-sm text-amber-200">
          <strong>Alerta de volatilidad:</strong>{' '}
          {triggered.map((a) => `${a.name} (${a.changePct > 0 ? '+' : ''}${a.changePct}%)`).join(' · ')}
        </div>
      )}

      <div className="flex gap-2">
        {GROUPS.map((g) => (
          <button
            key={g.id}
            onClick={() => {
              setGroup(g.id);
              const first = instruments.find((i) => (i.meta?.group as string) === g.id);
              if (first) setSelected(first.symbol);
            }}
            className={`rounded-lg px-4 py-2 text-sm font-medium ring-1 transition ${
              group === g.id
                ? 'bg-brand-600/30 text-brand-100 ring-brand-500/50'
                : 'text-slate-300 ring-ink-600 hover:bg-ink-700'
            }`}
          >
            {g.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title={`Contratos · ${GROUPS.find((g) => g.id === group)?.label}`}>
            <QuoteTable
              instruments={filtered}
              quotes={quotes}
              selected={selected}
              onSelect={setSelected}
            />
          </Card>
        </div>
        <InstrumentDetail
          instrument={current}
          quote={current ? quotes[current.symbol] : undefined}
          chart="candles"
        />
      </div>
    </div>
  );
}
