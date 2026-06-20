import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useLivePrices } from '../hooks/useLivePrices';
import { Card } from '../components/common/Card';
import { QuoteTable } from '../components/common/QuoteTable';
import { InstrumentDetail } from '../components/trading/InstrumentDetail';
import type { Instrument } from '../types';
import { fmtMxn, fmtNum } from '../lib/format';

export function Forex() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selected, setSelected] = useState<string>('USD/MXN');
  const { quotes } = useLivePrices();

  // Calculadora
  const [amount, setAmount] = useState(100);
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [spread, setSpread] = useState(0.04);
  const [result, setResult] = useState<{ rate: number; result: number; spread: number } | null>(null);

  useEffect(() => {
    api.instruments('forex').then(setInstruments);
  }, []);

  useEffect(() => {
    if (!selected) return;
    api
      .convert(selected, amount, side, spread)
      .then((r) => setResult({ rate: r.rate, result: r.result, spread: r.spread }))
      .catch(() => setResult(null));
  }, [selected, amount, side, spread, quotes[selected]?.price]);

  const current = instruments.find((i) => i.symbol === selected);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Divisas · Forex</h1>
        <p className="text-sm text-slate-400">
          Pares internacionales frente al peso mexicano (MXN), con calculadora de tipo de
          cambio, spreads configurables y velas japonesas para análisis técnico.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Pares contra el peso (MXN)">
            <QuoteTable
              instruments={instruments}
              quotes={quotes}
              selected={selected}
              onSelect={setSelected}
            />
          </Card>

          <Card title="Calculadora de tipo de cambio">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
              <label className="text-sm text-slate-400">
                Par
                <select
                  value={selected}
                  onChange={(e) => setSelected(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-white"
                >
                  {instruments.map((i) => (
                    <option key={i.symbol} value={i.symbol}>
                      {i.symbol}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm text-slate-400">
                Monto
                <input
                  type="number"
                  value={amount}
                  min={0}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-white"
                />
              </label>
              <label className="text-sm text-slate-400">
                Operación
                <select
                  value={side}
                  onChange={(e) => setSide(e.target.value as 'buy' | 'sell')}
                  className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-white"
                >
                  <option value="buy">Compra</option>
                  <option value="sell">Venta</option>
                </select>
              </label>
              <label className="text-sm text-slate-400">
                Spread ({spread})
                <input
                  type="range"
                  min={0}
                  max={0.2}
                  step={0.005}
                  value={spread}
                  onChange={(e) => setSpread(Number(e.target.value))}
                  className="mt-3 w-full"
                />
              </label>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-ink-900/60 p-3">
                <p className="text-xs text-slate-400">Tipo de cambio aplicado</p>
                <p className="text-lg font-semibold text-white">{result ? fmtNum(result.rate) : '—'}</p>
              </div>
              <div className="rounded-lg bg-ink-900/60 p-3">
                <p className="text-xs text-slate-400">Spread</p>
                <p className="text-lg font-semibold text-white">{result ? fmtNum(result.spread) : '—'}</p>
              </div>
              <div className="rounded-lg bg-brand-600/20 p-3 ring-1 ring-brand-500/40">
                <p className="text-xs text-brand-100">Resultado en MXN</p>
                <p className="text-lg font-semibold text-white">{result ? fmtMxn(result.result) : '—'}</p>
              </div>
            </div>
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
