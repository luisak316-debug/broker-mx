import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { fmtDate, clientFirstName, isoDate } from '../lib/format';
import { dialViaMicrosip } from '../lib/microsipCall';

export function AssignedContacts() {
  const today = isoDate(new Date());
  const [rows, setRows] = useState<
    Array<{
      id: string;
      clientName: string;
      phone: string;
      email: string;
      description: string;
      assignedDate: string;
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [callingId, setCallingId] = useState<string | null>(null);

  const [y, m, d] = today.split('-').map(Number);

  useEffect(() => {
    api
      .myContacts({ year: y, month: m, day: d })
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar contactos.'));
  }, [y, m, d]);

  async function onCall(id: string) {
    setCallingId(id);
    setError(null);
    setFeedback(null);
    try {
      const { dialString } = await api.contactCallDial(id);
      await dialViaMicrosip(dialString);
      setFeedback('Llamada enviada a MicroSIP.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo generar la marcación.');
    } finally {
      setCallingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Mis contactos de hoy</h1>
        <p className="text-sm text-slate-400">
          Asignados por supervisión · {fmtDate(today)} · teléfono enmascarado
        </p>
      </header>

      {error && <p className="text-sm text-danger">{error}</p>}
      {feedback && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-100">
          {feedback}
        </p>
      )}

      <Card title={`Contactos (${rows.length})`}>
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Teléfono</th>
                <th>Correo</th>
                <th>Notas</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400">
                    No tienes contactos asignados hoy.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium text-white" title={c.clientName}>
                      {clientFirstName(c.clientName)}
                    </td>
                    <td className="font-mono text-sm">{c.phone}</td>
                    <td>{c.email || '—'}</td>
                    <td className="max-w-xs truncate text-slate-300">{c.description || '—'}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="rounded-lg border border-emerald-500/40 bg-emerald-600/20 px-3 py-1.5 text-xs font-semibold text-emerald-100 hover:bg-emerald-600/35 disabled:opacity-50"
                        disabled={callingId === c.id}
                        onClick={() => void onCall(c.id)}
                      >
                        {callingId === c.id ? '…' : 'Llamar'}
                      </button>
                    </td>
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
