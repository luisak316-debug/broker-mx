import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { useCall } from '../call/CallContext';
import { Card } from '../components/ui/Card';
import { fmtDate, clientFirstName, isoDate } from '../lib/format';

export function ContactsPage() {
  const today = isoDate(new Date());
  const { startCall, phoneReady, phoneError } = useCall();
  const [rows, setRows] = useState<Awaited<ReturnType<typeof api.myContacts>>>([]);
  const [error, setError] = useState<string | null>(null);
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

  async function onCall(id: string, clientName: string) {
    setCallingId(id);
    setError(null);
    try {
      await startCall(id, clientName);
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

      {!phoneReady && phoneError && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-950/30 px-3 py-2 text-sm text-amber-100">
          {phoneError}
        </p>
      )}

      {error && <p className="text-sm text-danger">{error}</p>}

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
                        disabled={callingId === c.id || !phoneReady}
                        onClick={() => void onCall(c.id, c.clientName)}
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
        Pulsa <strong className="text-slate-400">Llamar</strong> y aparece la ventana INVERMAX en
        tu pantalla. No se abre MicroSIP ni se muestran credenciales del sistema.
      </p>
    </div>
  );
}
