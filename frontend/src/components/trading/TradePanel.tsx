import { useState } from 'react';
import { api } from '../../api/client';
import type { PositionDirection, Quote } from '../../types';
import { fmtNum } from '../../lib/format';

/** Panel de simulación de compra/venta con soporte de posiciones largas y cortas. */
export function TradePanel({ symbol, quote }: { symbol: string; quote?: Quote }) {
  const [quantity, setQuantity] = useState(1);
  const [direction, setDirection] = useState<PositionDirection>('long');
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(side: 'buy' | 'sell') {
    setBusy(true);
    setStatus(null);
    try {
      await api.placeOrder({ symbol, side, direction, quantity });
      setStatus(`Orden ${side === 'buy' ? 'de compra' : 'de venta'} ejecutada (simulada).`);
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Error al ejecutar la orden.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        {(['long', 'short'] as PositionDirection[]).map((d) => (
          <button
            key={d}
            onClick={() => setDirection(d)}
            className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ring-1 transition ${
              direction === d
                ? 'bg-brand-600/30 text-brand-100 ring-brand-500/50'
                : 'text-slate-300 ring-ink-600 hover:bg-ink-700'
            }`}
          >
            {d === 'long' ? 'Posición Larga' : 'Posición Corta'}
          </button>
        ))}
      </div>

      <label className="block text-sm text-slate-400">
        Cantidad
        <input
          type="number"
          min={0}
          step="any"
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          className="mt-1 w-full rounded-lg border border-ink-600 bg-ink-900 px-3 py-2 text-white outline-none focus:border-brand-500"
        />
      </label>

      <div className="grid grid-cols-2 gap-2 text-sm text-slate-400">
        <div className="rounded-lg bg-ink-900/60 p-2">
          <p className="text-xs">Compra (ask)</p>
          <p className="font-semibold text-white">{quote ? fmtNum(quote.ask) : '—'}</p>
        </div>
        <div className="rounded-lg bg-ink-900/60 p-2">
          <p className="text-xs">Venta (bid)</p>
          <p className="font-semibold text-white">{quote ? fmtNum(quote.bid) : '—'}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button disabled={busy} onClick={() => submit('buy')} className="btn-buy disabled:opacity-50">
          Comprar
        </button>
        <button disabled={busy} onClick={() => submit('sell')} className="btn-sell disabled:opacity-50">
          Vender
        </button>
      </div>

      {status && <p className="text-xs text-slate-300">{status}</p>}
      <p className="text-[11px] leading-tight text-slate-500">
        Operación simulada. Liquidación en saldo MXN ficticio para fines educativos.
      </p>
    </div>
  );
}
