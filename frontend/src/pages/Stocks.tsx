import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useLivePrices } from '../hooks/useLivePrices';
import { Card } from '../components/common/Card';
import { QuoteTable } from '../components/common/QuoteTable';
import { InstrumentDetail } from '../components/trading/InstrumentDetail';
import type { DividendRecord, Instrument } from '../types';
import { fmtDate, fmtNum, fmtPct } from '../lib/format';

export function Stocks() {
  const [instruments, setInstruments] = useState<Instrument[]>([]);
  const [selected, setSelected] = useState<string>('AAPL');
  const [dividends, setDividends] = useState<DividendRecord[]>([]);
  const { quotes } = useLivePrices();

  useEffect(() => {
    api.instruments('stock').then((list) => {
      setInstruments(list);
      if (list.length && !list.some((i) => i.symbol === selected)) setSelected(list[0].symbol);
    });
  }, []);

  useEffect(() => {
    if (selected) api.dividends(selected).then(setDividends).catch(() => setDividends([]));
  }, [selected]);

  const current = instruments.find((i) => i.symbol === selected);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Bolsa de Valores · Acciones</h1>
        <p className="text-sm text-slate-400">
          Cotizaciones en tiempo real, rendimiento histórico y simulación de compra/venta
          (posiciones largas y cortas).
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card title="Acciones disponibles">
            <QuoteTable
              instruments={instruments}
              quotes={quotes}
              selected={selected}
              onSelect={setSelected}
            />
          </Card>

          <Card title={`Historial de dividendos · ${selected}`}>
            {dividends.length ? (
              <div className="overflow-x-auto">
                <table className="table-base">
                  <thead>
                    <tr>
                      <th>Fecha ex-dividendo</th>
                      <th>Fecha de pago</th>
                      <th className="text-right">Monto/acción</th>
                      <th className="text-right">Rendimiento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dividends.map((d, i) => (
                      <tr key={i}>
                        <td>{fmtDate(d.exDate)}</td>
                        <td>{fmtDate(d.paymentDate)}</td>
                        <td className="text-right">
                          {fmtNum(d.amountPerShare)} {d.currency}
                        </td>
                        <td className="text-right text-bull">{fmtPct(d.yieldPct)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-slate-400">
                Esta emisora no registra pagos de dividendos en el periodo simulado.
              </p>
            )}
          </Card>
        </div>

        <InstrumentDetail instrument={current} quote={current ? quotes[current.symbol] : undefined} />
      </div>
    </div>
  );
}
