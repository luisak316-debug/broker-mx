import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Card } from '../common/Card';
import { Change } from '../common/Change';
import { PriceAreaChart } from '../charts/PriceAreaChart';
import { CandlestickChart } from '../charts/CandlestickChart';
import { TradePanel } from './TradePanel';
import type { Candle, Instrument, Quote } from '../../types';
import { fmtNum } from '../../lib/format';

export function InstrumentDetail({
  instrument,
  quote,
  chart = 'area',
}: {
  instrument?: Instrument;
  quote?: Quote;
  chart?: 'area' | 'candles';
}) {
  const [candles, setCandles] = useState<Candle[]>([]);
  const [mode, setMode] = useState<'area' | 'candles'>(chart);

  useEffect(() => {
    if (!instrument) return;
    api.candles(instrument.symbol, 120, 3600).then(setCandles).catch(() => setCandles([]));
  }, [instrument?.symbol]);

  if (!instrument) {
    return (
      <Card title="Detalle">
        <p className="text-sm text-slate-400">Selecciona un instrumento de la tabla.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card
        title={`${instrument.symbol} · ${instrument.name}`}
        action={
          <div className="flex gap-1">
            {(['area', 'candles'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`rounded-md px-2 py-1 text-xs ${
                  mode === m ? 'bg-brand-600/30 text-brand-100' : 'text-slate-400 hover:bg-ink-700'
                }`}
              >
                {m === 'area' ? 'Rendimiento' : 'Velas'}
              </button>
            ))}
          </div>
        }
      >
        <div className="mb-3 flex items-end gap-3">
          <span className="text-3xl font-bold text-white">
            {quote ? fmtNum(quote.price) : '—'}
          </span>
          <span className="pb-1 text-sm text-slate-400">{instrument.currency}</span>
          {quote && <span className="pb-1">{<Change pct={quote.changePct} abs={quote.changeAbs} />}</span>}
        </div>
        {mode === 'area' ? (
          <PriceAreaChart candles={candles} />
        ) : (
          <CandlestickChart candles={candles} />
        )}
      </Card>

      <Card title="Operar">
        <TradePanel symbol={instrument.symbol} quote={quote} />
      </Card>
    </div>
  );
}
