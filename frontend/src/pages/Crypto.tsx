import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useLivePrices } from '../hooks/useLivePrices';
import { Card } from '../components/common/Card';
import { QuoteTable } from '../components/common/QuoteTable';
import { InstrumentDetail } from '../components/trading/InstrumentDetail';
import type { Instrument } from '../types';
import { fmtTime } from '../lib/format';

export function Crypto() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selected, setSelected] = useState<string>('BTC');
  const { quotes, connected } = useLivePrices();

  useEffect(() => {
    api.instruments('crypto').then(setInstruments);
  }, []);

  const current = instruments.find((i) => i.symbol === selected);
  const lastUpdate = current ? quotes[current.symbol]?.updatedAt : undefined;

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Criptomonedas</h1>
          <p className="text-sm text-slate-400">
            Seguimiento de activos digitales con precios 24/7. Conexión simulada vía API con
            exchanges principales (Bitso / Binance).
          </p>
        </div>
        <span className="flex items-center gap-2 rounded-full bg-ink-800 px-3 py-1 text-xs text-slate-300 ring-1 ring-ink-600">
          <span className={`h-2 w-2 rounded-full ${connected ? 'bg-bull' : 'bg-bear'}`} />
          {connected ? 'En vivo' : 'Reconectando'} ·{' '}
          {lastUpdate ? fmtTime(lastUpdate) : '—'}
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card title="Activos digitales (mercado 24/7)">
            <QuoteTable
              instruments={instruments}
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
