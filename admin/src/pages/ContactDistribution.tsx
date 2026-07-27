import { useEffect, useMemo, useState } from 'react';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { fmtDate, clientFirstName, isoDate } from '../lib/format';

function parseIso(iso: string): { year: number; month: number; day: number } {
  const [year, month, day] = iso.split('-').map(Number);
  return { year, month, day };
}

export function ContactDistribution() {
  const [date, setDate] = useState(isoDate(new Date()));
  const [data, setData] = useState<Awaited<ReturnType<typeof api.contactsDistribution>> | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { year, month, day } = useMemo(() => parseIso(date), [date]);

  useEffect(() => {
    setLoading(true);
    setError(null);
    api
      .contactsDistribution({ year, month, day })
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar.'))
      .finally(() => setLoading(false));
  }, [year, month, day]);

  const advisorsWithContacts = useMemo(() => {
    if (!data) return 0;
    return data.teams.reduce(
      (sum, t) => sum + t.advisors.filter((a) => a.contactCount > 0).length,
      0,
    );
  }, [data]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Repartición de contactos</h1>
          <p className="text-sm text-slate-400">
            Vista general por gerencia y asesor · teléfonos enmascarados
          </p>
        </div>
        <div className="w-full sm:w-auto">
          <label className="label">Fecha de asignación</label>
          <input
            type="date"
            className="input"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>
      </header>

      {error && <p className="text-sm text-danger">{error}</p>}

      {loading ? (
        <p className="text-sm text-slate-400">Cargando repartición…</p>
      ) : data ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <p className="text-xs uppercase tracking-wide text-slate-500">Contactos del día</p>
              <p className="mt-1 text-2xl font-bold text-white">{data.totalContacts}</p>
              <p className="text-xs text-slate-400">{fmtDate(data.assignedDate)}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-slate-500">Asesores activos</p>
              <p className="mt-1 text-2xl font-bold text-white">{data.advisorCount}</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wide text-slate-500">Con contactos hoy</p>
              <p className="mt-1 text-2xl font-bold text-white">{advisorsWithContacts}</p>
            </Card>
          </div>

          {data.totalContacts === 0 ? (
            <Card title="Sin asignaciones">
              <p className="text-sm text-slate-400">
                No hay contactos asignados para {fmtDate(data.assignedDate)}. Reparte desde
                Supervisores → Asignar contactos.
              </p>
            </Card>
          ) : (
            data.teams.map((team) => (
              <Card
                key={team.team ?? 'none'}
                title={`${team.label} (${team.contactCount} contacto${team.contactCount === 1 ? '' : 's'})`}
              >
                <div className="space-y-6">
                  {team.advisors.map((advisor) => (
                    <div key={advisor.advisorId}>
                      <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-semibold text-white">{advisor.advisorName}</h3>
                        <span className="text-xs text-slate-400">
                          {advisor.contactCount} contacto{advisor.contactCount === 1 ? '' : 's'}
                        </span>
                      </div>
                      {advisor.contactCount === 0 ? (
                        <p className="text-sm text-slate-500">Sin contactos asignados hoy.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="table-base text-sm">
                            <thead>
                              <tr>
                                <th>Cliente</th>
                                <th>Teléfono</th>
                                <th>Correo</th>
                                <th>Notas</th>
                              </tr>
                            </thead>
                            <tbody>
                              {advisor.contacts.map((c) => (
                                <tr key={c.id}>
                                  <td className="font-medium text-white" title={c.clientName}>
                                    {clientFirstName(c.clientName)}
                                  </td>
                                  <td className="font-mono text-xs">{c.phone}</td>
                                  <td>{c.email || '—'}</td>
                                  <td className="max-w-xs truncate text-slate-300">
                                    {c.description || '—'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))
          )}
        </>
      ) : null}
    </div>
  );
}
