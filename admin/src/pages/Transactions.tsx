import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import type { Transaction } from '../types';
import { CATEGORY_LABEL, fmtDateTime, fmtMxn, clientFirstName } from '../lib/format';

const CATS = ['', 'stock', 'commodity', 'forex', 'crypto'];

export function Transactions() {
  const [rows, setRows] = useState<Transaction[]>([]);
  const [category, setCategory] = useState('');

  useEffect(() => {
    api.transactions({ category: category || undefined }).then(setRows);
  }, [category]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Historial de Transacciones</h1>
        <p className="text-sm text-slate-400">
          Movimientos de clientes en las 4 categorías de mercado.
        </p>
      </header>

      <Card
        action={
          <div className="flex gap-1">
            {CATS.map((c) => (
              <button
                key={c || 'all'}
                onClick={() => setCategory(c)}
                className={`rounded-md px-3 py-1 text-xs ${
                  category === c ? 'bg-brand-600/30 text-brand-100' : 'text-slate-400 hover:bg-ink-700'
                }`}
              >
                {c ? CATEGORY_LABEL[c] : 'Todas'}
              </button>
            ))}
          </div>
        }
        title="Movimientos"
      >
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Categoría</th>
                <th>Símbolo</th>
                <th>Operación</th>
                <th className="text-right">Cantidad</th>
                <th className="text-right">Monto (MXN)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => (
                <tr key={t.id}>
                  <td className="text-slate-300">{fmtDateTime(t.createdAt)}</td>
                  <td>
                    <Link
                      to={`/clientes/${t.userId}`}
                      className="truncate text-brand-400 hover:underline"
                      title={t.clientName ?? t.userId}
                    >
                      {clientFirstName(t.clientName ?? t.userId)}
                    </Link>
                  </td>
                  <td className="text-slate-300">{CATEGORY_LABEL[t.category]}</td>
                  <td className="font-medium text-white">{t.symbol}</td>
                  <td className="text-slate-300">
                    {t.side === 'buy' ? 'Compra' : 'Venta'} · {t.direction === 'long' ? 'Largo' : 'Corto'}
                  </td>
                  <td className="text-right text-slate-300">{t.quantity}</td>
                  <td className="text-right text-slate-200">{fmtMxn(t.amountMxn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
