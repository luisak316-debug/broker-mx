import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { ClientAvatar } from '../components/ui/ClientAvatar';
import { clientFirstName, fmtDate, fmtMxn, fmtPhone } from '../lib/format';

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

  useEffect(() => {
    function reload() {
      api
        .clients(q || undefined)
        .then(setRows)
        .catch(() => undefined);
    }
    window.addEventListener('focus', reload);
    const interval = window.setInterval(reload, 30_000);
    return () => {
      window.removeEventListener('focus', reload);
      window.clearInterval(interval);
    };
  }, [q]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Clientes</h1>
        <p className="text-sm text-slate-400">
          Cuánto ha invertido cada cliente registrado en la plataforma.
        </p>
      </header>

      <Card>
        <label className="label">Buscar</label>
        <input
          className="input mb-4 max-w-md"
          placeholder="Nombre, correo o teléfono…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />

        {loading ? (
          <p className="py-8 text-center text-slate-400">Cargando…</p>
        ) : rows.length === 0 ? (
          <p className="py-8 text-center text-slate-400">Sin clientes.</p>
        ) : (
          <>
            {/* Móvil: tarjetas ordenadas */}
            <div className="space-y-3 md:hidden">
              {rows.map((c) => (
                <article
                  key={c.id}
                  className="flex gap-3 rounded-xl border border-ink-600/60 bg-ink-800/40 p-3"
                >
                  <ClientAvatar
                    displayName={c.displayName}
                    photoUrl={c.profilePhotoUrl}
                    size="md"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-white" title={c.displayName}>
                      {clientFirstName(c.displayName)}
                    </p>
                    <p className="truncate text-xs text-slate-500">{c.id}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">
                      {fmtPhone(c.phone)} · {c.advisorName ?? 'Sin asesor'}
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className="font-medium text-brand-400">
                        {fmtMxn(c.totalInvestedMxn)} invertido
                      </span>
                      <span className="shrink-0 text-slate-300">{fmtMxn(c.cashMxn)} saldo</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Escritorio: tabla */}
            <div className="hidden overflow-x-auto md:block">
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
                  {rows.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <ClientAvatar
                            displayName={c.displayName}
                            photoUrl={c.profilePhotoUrl}
                            size="md"
                          />
                          <div className="min-w-0">
                            <p className="truncate font-medium text-white" title={c.displayName}>
                              {c.displayName}
                            </p>
                            <p className="text-xs text-slate-500">{c.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap">{fmtPhone(c.phone)}</td>
                      <td className="max-w-[200px] truncate">{c.email}</td>
                      <td>{c.advisorName ?? '—'}</td>
                      <td className="text-right font-medium text-brand-400">
                        {fmtMxn(c.totalInvestedMxn)}
                      </td>
                      <td className="text-right">{fmtMxn(c.cashMxn)}</td>
                      <td className="whitespace-nowrap">{fmtDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}
