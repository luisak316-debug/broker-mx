import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { fmtDate, isoDate, shiftDays, clientFirstName } from '../lib/format';
import type { AdvisorRow, ContactRow } from '../types';

export function HistoryPage() {
  const [advisors, setAdvisors] = useState<AdvisorRow[]>([]);
  const [advisorId, setAdvisorId] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [day, setDay] = useState(new Date().getDate());
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(false);

  const years = useMemo(() => {
    const y = new Date().getFullYear();
    return [y, y - 1, y - 2];
  }, []);

  function load() {
    setLoading(true);
    api
      .contacts({ advisorId: advisorId || undefined, year, month, day })
      .then(setRows)
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    api.advisors().then((list) => {
      setAdvisors(list);
      if (list[0]) setAdvisorId(list[0].id);
    });
  }, []);

  useEffect(() => {
    load();
  }, [advisorId, year, month, day]);

  function pickDate(d: Date) {
    setYear(d.getFullYear());
    setMonth(d.getMonth() + 1);
    setDay(d.getDate());
  }

  const selectedIso = isoDate(new Date(year, month - 1, day));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Historial de contactos</h1>
        <p className="text-sm text-slate-400">
          Consulta qué contactos enviaste a cada asesor por día, mes o año.
        </p>
      </header>

      <Card title="Filtros">
        <div className="mb-4 flex flex-wrap gap-2">
          <button type="button" className="btn-ghost text-xs" onClick={() => pickDate(new Date())}>
            Hoy
          </button>
          <button type="button" className="btn-ghost text-xs" onClick={() => pickDate(shiftDays(new Date(), -1))}>
            Ayer
          </button>
          <button type="button" className="btn-ghost text-xs" onClick={() => pickDate(shiftDays(new Date(), -2))}>
            Antier
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-2">
            <label className="label">Asesor</label>
            <select className="input" value={advisorId} onChange={(e) => setAdvisorId(e.target.value)}>
              <option value="">Todos</option>
              {advisors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.displayName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Año</label>
            <select className="input" value={year} onChange={(e) => setYear(Number(e.target.value))}>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Mes</label>
            <select className="input" value={month} onChange={(e) => setMonth(Number(e.target.value))}>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(2000, m - 1, 1).toLocaleDateString('es-MX', { month: 'long' })}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Día</label>
            <select className="input" value={day} onChange={(e) => setDay(Number(e.target.value))}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p className="mt-4 text-sm text-slate-400">
          Mostrando contactos del <span className="text-white">{fmtDate(selectedIso)}</span>
          {advisorId ? ` · ${advisors.find((a) => a.id === advisorId)?.displayName}` : ' · todos los asesores'}
        </p>
      </Card>

      <Card title="Contactos asignados">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Asesor</th>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Descripción</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Cargando…
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No hay contactos en esta fecha.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id}>
                    <td>{fmtDate(c.assignedDate)}</td>
                    <td>{c.advisorName}</td>
                    <td className="max-w-[140px] truncate font-medium text-white" title={c.clientName}>
                      {clientFirstName(c.clientName)}
                    </td>
                    <td>{c.phone}</td>
                    <td>{c.email || '—'}</td>
                    <td className="max-w-sm text-slate-300">{c.description || '—'}</td>
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
