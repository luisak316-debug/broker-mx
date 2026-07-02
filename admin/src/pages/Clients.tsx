import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ClientAvatar } from '../components/ui/ClientAvatar';
import type { ClientRow } from '../types';
import { fmtDate, fmtMxn, clientFirstName, fmtPhone } from '../lib/format';

export function Clients() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<ClientRow[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [kyc, setKyc] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      api
        .clients({ q, status: status || undefined, kyc: kyc || undefined })
        .then(setRows)
        .finally(() => setLoading(false));
    }, 250);
    return () => clearTimeout(t);
  }, [q, status, kyc]);

  useEffect(() => {
    function reload() {
      api
        .clients({ q, status: status || undefined, kyc: kyc || undefined })
        .then(setRows)
        .catch(() => undefined);
    }
    window.addEventListener('focus', reload);
    const interval = window.setInterval(reload, 30_000);
    return () => {
      window.removeEventListener('focus', reload);
      window.clearInterval(interval);
    };
  }, [q, status, kyc]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Directorio de clientes</h1>
        <p className="text-sm text-slate-400">
          Todos los clientes registrados persisten en base de datos. Para agregar o quitar dinero,
          abre el perfil del cliente → sección <strong className="text-slate-300">Agregar / remover fondos</strong>.
        </p>
      </header>

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="label">Buscar (nombre, ID, correo o teléfono)</label>
            <input
              className="input"
              placeholder="Ej. Bryan, CLI-1001, 5512345678…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <div>
            <label className="label">Estado de cuenta</label>
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              <option value="ACTIVA">Activa</option>
              <option value="SUSPENDIDA">Suspendida</option>
              <option value="BLOQUEADA">Bloqueada</option>
              <option value="CERRADA">Cerrada</option>
            </select>
          </div>
          <div>
            <label className="label">KYC</label>
            <select className="input" value={kyc} onChange={(e) => setKyc(e.target.value)}>
              <option value="">Todos</option>
              <option value="APPROVED">Aprobado</option>
              <option value="IN_REVIEW">En revisión</option>
              <option value="PENDING">Pendiente</option>
              <option value="REJECTED">Rechazado</option>
            </select>
          </div>
        </div>

        {loading && (
          <p className="py-8 text-center text-slate-400 md:hidden">Cargando…</p>
        )}
        {!loading && rows.length === 0 && (
          <p className="py-8 text-center text-slate-400 md:hidden">
            No se encontraron clientes con esos criterios.
          </p>
        )}

        <div className="hidden overflow-x-auto md:block">
          <table className="table-base">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Contraseña</th>
                <th>Registro</th>
                <th>Estado</th>
                <th className="text-right">Saldo</th>
                <th className="text-right">Invertido</th>
                <th>Solicitud retiro</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr
                  key={c.id}
                  className="cursor-pointer"
                  onClick={() => navigate(`/clientes/${c.id}`)}
                >
                  <td>
                    <div className="flex items-center gap-3">
                      <ClientAvatar
                        displayName={c.displayName}
                        photoUrl={c.profilePhotoUrl}
                        size="md"
                      />
                      <div className="min-w-0">
                        <div className="truncate font-medium text-white" title={c.displayName}>
                          {clientFirstName(c.displayName)}
                        </div>
                        <div className="text-xs text-slate-400">
                          {c.id} · {c.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="text-slate-300">{c.phone ?? '—'}</td>
                  <td className="font-mono text-xs text-amber-200">{c.plainPassword ?? '—'}</td>
                  <td className="text-xs text-slate-400">{fmtDate(c.createdAt)}</td>
                  <td>
                    <Badge value={c.accountStatus} />
                  </td>
                  <td className="text-right font-semibold text-white">{fmtMxn(c.cashMxn)}</td>
                  <td className="text-right font-semibold text-slate-300">
                    {fmtMxn(c.totalInvestedMxn)}
                  </td>
                  <td className="text-xs text-slate-400">
                    {c.lastWithdrawalRequestAt ? fmtDate(c.lastWithdrawalRequestAt) : '—'}
                  </td>
                  <td className="text-right">
                    <button
                      type="button"
                      className="btn-primary px-2 py-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/clientes/${c.id}#gestion-fondos`);
                      }}
                    >
                      Gestionar fondos
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-6 text-center text-slate-400">
                    No se encontraron clientes con esos criterios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && rows.length > 0 && (
          <div className="space-y-3 md:hidden">
            {rows.map((c) => (
              <button
                key={c.id}
                type="button"
                className="flex w-full gap-3 rounded-xl border border-ink-600/60 bg-ink-800/40 p-3 text-left"
                onClick={() => navigate(`/clientes/${c.id}`)}
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
                    {fmtPhone(c.phone)} · {c.accountStatus}
                  </p>
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-white">{fmtMxn(c.cashMxn)}</span>
                    <span className="text-slate-400">{fmtMxn(c.totalInvestedMxn)} inv.</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
