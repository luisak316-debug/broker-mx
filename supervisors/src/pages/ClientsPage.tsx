import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { fmtDate, fmtMxn } from '../lib/format';

export function ClientsPage() {
  const [rows, setRows] = useState<Awaited<ReturnType<typeof api.clients>>>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .clients(q || undefined)
        .then(setRows)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
        <p className="text-sm text-slate-400">Cuánto ha invertido cada cliente registrado en la plataforma.</p>
      </header>

      <Card>
        <label className="label">Buscar</label>
        <input
          className="input mb-4 max-w-md"
          placeholder="Nombre, correo o teléfono…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Asesor</th>
                <th className="text-right">Invertido</th>
                <th className="text-right">Saldo</th>
                <th>Alta</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Cargando…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Sin clientes.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <p className="font-medium text-white">{c.displayName}</p>
                      <p className="text-xs text-slate-500">{c.id}</p>
                    </td>
                    <td>{c.phone ?? '—'}</td>
                    <td>{c.email}</td>
                    <td>{c.advisorName ?? '—'}</td>
                    <td className="text-right font-medium text-brand-400">{fmtMxn(c.totalInvestedMxn)}</td>
                    <td className="text-right">{fmtMxn(c.cashMxn)}</td>
                    <td>{fmtDate(c.createdAt)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
