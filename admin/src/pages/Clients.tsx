import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import type { ClientRow } from '../types';
import { fmtMxn } from '../lib/format';

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

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Gestión de Clientes (CRM)</h1>
        <p className="text-sm text-slate-400">Busca, filtra y abre la ficha de cada cliente.</p>
      </header>

      <Card>
        <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label className="label">Buscar (nombre, ID o correo)</label>
            <input
              className="input"
              placeholder="Ej. Ana, CLI-1001, correo@…"
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

        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>ID</th>
                <th>Estado</th>
                <th>KYC</th>
                <th>Asesor</th>
                <th className="text-right">Saldo (MXN)</th>
                <th className="text-right">Invertido (MXN)</th>
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
                    <div className="font-medium text-white">{c.displayName}</div>
                    <div className="text-xs text-slate-400">{c.email}</div>
                  </td>
                  <td className="text-slate-300">{c.id}</td>
                  <td><Badge value={c.accountStatus} /></td>
                  <td><Badge value={c.kycStatus} /></td>
                  <td className="text-slate-300">{c.advisorName ?? '—'}</td>
                  <td className="text-right font-semibold text-white">{fmtMxn(c.cashMxn)}</td>
                  <td className="text-right text-slate-300">{fmtMxn(c.totalInvestedMxn)}</td>
                </tr>
              ))}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-6 text-center text-slate-400">
                    No se encontraron clientes con esos criterios.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
