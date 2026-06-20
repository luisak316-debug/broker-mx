import type { Instrument, Quote } from '../../types';
import { Change } from './Change';
import { fmtNum } from '../../lib/format';

export function QuoteTable({
  instruments,
  quotes,
  selected,
  onSelect,
}: {
  instruments: Instrument[];
  quotes: Record<string, Quote>;
  selected?: string;
  onSelect?: (symbol: string) => void;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="table-base">
        <thead>
          <tr>
            <th>Instrumento</th>
            <th className="text-right">Último</th>
            <th className="text-right">Compra</th>
            <th className="text-right">Venta</th>
            <th className="text-right">Cambio 24h</th>
          </tr>
        </thead>
        <tbody>
          {instruments.map((inst) => {
            const q = quotes[inst.symbol];
            const active = selected === inst.symbol;
            return (
              <tr
                key={inst.symbol}
                onClick={() => onSelect?.(inst.symbol)}
                className={`cursor-pointer ${active ? 'bg-brand-600/15' : ''}`}
              >
                <td>
                  <div className="font-medium text-white">{inst.symbol}</div>
                  <div className="text-xs text-slate-400">{inst.name}</div>
                </td>
                <td className="text-right font-semibold text-white">
                  {q ? fmtNum(q.price) : '—'}
                  <span className="ml-1 text-xs text-slate-500">{inst.currency}</span>
                </td>
                <td className="text-right text-slate-300">{q ? fmtNum(q.ask) : '—'}</td>
                <td className="text-right text-slate-300">{q ? fmtNum(q.bid) : '—'}</td>
                <td className="text-right">{q ? <Change pct={q.changePct} /> : '—'}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
