import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { fmtDate, clientFirstName, isoDate } from '../lib/format';
import { dialViaMicrosip } from '../lib/microsipCall';

export function ContactsPage() {
  const today = isoDate(new Date());
  const [rows, setRows] = useState<Awaited<ReturnType<typeof api.myContacts>>>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [callingId, setCallingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [y, m, d] = today.split('-').map(Number);

  useEffect(() => {
    setLoading(true);
    api
      .myContacts({ year: y, month: m, day: d })
      .then(setRows)
      .catch((e) => setError(e instanceof Error ? e.message : 'Error al cargar contactos.'))
      .finally(() => setLoading(false));
  }, [y, m, d]);

  async function onCall(id: string) {
    setCallingId(id);
    setError(null);
    setFeedback(null);
    try {
      const { dialString } = await api.contactCallDial(id);
      await dialViaMicrosip(dialString);
      setFeedback(
        'Llamada enviada a MicroSIP. Si no marca, ejecuta una vez tools\\invermax-call\\INSTALAR_LLAMADAS.bat en esta laptop.',
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo iniciar la llamada.');
    } finally {
      setCallingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Mis contactos de hoy</h1>
        <p className="text-sm text-slate-400">
          {fmtDate(today)} · {rows.length} contacto{rows.length === 1 ? '' : 's'} · teléfono
          enmascarado
        </p>
      </header>

      {error && <p className="text-sm text-danger">{error}</p>}
      {feedback && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-950/30 px-3 py-2 text-sm text-emerald-100">
          {feedback}
        </p>
      )}

      <Card title={loading ? 'Cargando…' : `Contactos (${rows.length})`}>
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
              {!loading && rows.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-slate-400">
                    No tienes contactos asignados hoy. Supervisión los reparte por la mañana.
                  </td>
                </tr>
              ) : (
                rows.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium text-white" title={c.clientName}>
                      {clientFirstName(c.clientName)}
                    </td>
                    <td className="font-mono text-xs">{c.phone}</td>
                    <td>{c.email || '—'}</td>
                    <td className="max-w-xs truncate text-slate-300">{c.description || '—'}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn-call px-3 py-1.5 text-xs font-semibold"
                        disabled={callingId === c.id}
                        onClick={() => void onCall(c.id)}
                      >
                        {callingId === c.id ? '…' : '📞 Llamar'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="text-xs text-slate-500">
        Pulsa <strong className="text-slate-400">Llamar</strong> y la marcación se abre en MicroSIP al
        instante. Primera vez en la laptop: ejecuta{' '}
        <code className="text-slate-400">tools\invermax-call\INSTALAR_LLAMADAS.bat</code>.
      </p>
    </div>
  );
}
