import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useLivePrices } from '../hooks/useLivePrices';
import { Card } from '../components/common/Card';
import { QuoteTable } from '../components/common/QuoteTable';
import { InstrumentDetail } from '../components/trading/InstrumentDetail';
import type { Instrument } from '../types';

export function Indexes() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selected, setSelected] = useState<string>('SPX');
  const { quotes } = useLivePrices();

  useEffect(() => {
    api.instruments('index').then((list) => {
      setInstruments(list);
      if (list.length && !list.some((i) => i.symbol === selected)) setSelected(list[0].symbol);
    });
  }, []);

  const current = instruments.find((i) => i.symbol === selected);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Índices Bursátiles</h1>
        <p className="text-sm text-slate-400">
          Sigue el rendimiento de los principales índices globales y opera con la misma cuenta.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <Card title="Índices disponibles">
            <QuoteTable
              instruments={instruments}
              quotes={quotes}
              selected={selected}
              onSelect={setSelected}
            />
          </Card>
        </div>

        {current ? (
          <InstrumentDetail instrument={current} quote={quotes[current.symbol]} />
        ) : null}
      </div>
    </div>
  );
}
