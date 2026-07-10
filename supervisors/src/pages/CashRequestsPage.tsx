import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import type { CashRequest } from '../types';
import { fmtDateTime, fmtMxn, clientFirstName } from '../lib/format';

export function CashRequestsPage() {
  const [rows, setRows] = useState<CashRequest[]>([]);
  const [filter, setFilter] = useState('PENDIENTE');
  const [pending, setPending] = useState<{ req: CashRequest; status: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  function load() {
    api.cashRequests(filter || undefined).then(setRows);
  }
  useEffect(load, [filter]);

  async function review() {
    if (!pending) return;
    setBusy(true);
    try {
      await api.reviewCashRequest(pending.req.id, { status: pending.status });
      setFeedback('Solicitud actualizada y registrada en auditoría.');
      setPending(null);
      load();
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : 'Error al procesar la solicitud.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Solicitudes de Efectivo</h1>
        <p className="text-sm text-slate-400">
          Aprueba o rechaza depósitos. Los retiros se registran al instante desde la app del cliente.
        </p>
      </header>

      {feedback && (
        <div className="rounded-lg border border-brand-500/40 bg-brand-600/15 px-3 py-2 text-sm text-brand-100">
          {feedback}
        </div>
      )}

      <Card
        title="Solicitudes"
        action={
          <div className="flex gap-1">
            {['PENDIENTE', 'APROBADA', 'RECHAZADA', ''].map((s) => (
              <button
                key={s || 'all'}
                type="button"
                onClick={() => setFilter(s)}
                className={`rounded-md px-3 py-1 text-xs ${
                  filter === s ? 'bg-brand-600/30 text-brand-100' : 'text-slate-400 hover:bg-ink-700'
                }`}
              >
                {s || 'Todas'}
              </button>
            ))}
          </div>
        }
      >
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Tipo</th>
                <th>Método</th>
                <th>Cuenta destino</th>
                <th className="text-right">Monto (MXN)</th>
                <th>Estado</th>
                <th className="text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id}>
                  <td className="text-slate-300">{fmtDateTime(r.createdAt)}</td>
                  <td>
                    <span className="truncate text-white" title={r.clientName}>
                      {clientFirstName(r.clientName)}
                    </span>
                  </td>
                  <td>
                    <Badge value={r.type} />
                  </td>
                  <td className="text-slate-300">{r.method ?? '—'}</td>
                  <td className="max-w-[220px] text-xs text-slate-300">
                    {r.type === 'RETIRO' && r.payoutBank ? (
                      <span>
                        {r.payoutBank}
                        {r.payoutOwnerName ? ` · ${r.payoutOwnerName}` : ''}
                        {r.payoutConcept ? (
                          <>
                            <br />
                            <span className="text-slate-500">{r.payoutConcept}</span>
                          </>
                        ) : null}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="text-right font-semibold text-white">{fmtMxn(r.amountMxn)}</td>
                  <td>
                    <Badge value={r.status} />
                  </td>
                  <td className="text-right">
                    {r.status === 'PENDIENTE' && r.type === 'DEPOSITO' ? (
                      <div className="flex justify-end gap-1">
                        <button
                          type="button"
                          className="btn-ok px-2 py-1 text-xs"
                          onClick={() => setPending({ req: r, status: 'APROBADA' })}
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          className="btn-danger px-2 py-1 text-xs"
                          onClick={() => setPending({ req: r, status: 'RECHAZADA' })}
                        >
                          Rechazar
                        </button>
                      </div>
                    ) : r.type === 'RETIRO' ? (
                      <span className="text-xs text-slate-500">Registrado</span>
                    ) : (
                      <span className="text-xs text-slate-500">
                        {r.reviewedByName ? `Por ${r.reviewedByName}` : '—'}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-6 text-center text-slate-400">
                    Sin solicitudes en este filtro.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={!!pending}
        title={pending?.status === 'APROBADA' ? '¿Aprobar solicitud?' : '¿Rechazar solicitud?'}
        confirmLabel={pending?.status === 'APROBADA' ? 'Sí, aprobar' : 'Sí, rechazar'}
        tone={pending?.status === 'APROBADA' ? 'ok' : 'danger'}
        busy={busy}
        onCancel={() => setPending(null)}
        onConfirm={review}
      >
        {pending && (
          <>
            {pending.status === 'APROBADA' ? 'Aprobarás' : 'Rechazarás'} la solicitud de{' '}
            <strong className="text-white">{pending.req.type.toLowerCase()}</strong> por{' '}
            <strong className="text-white">{fmtMxn(pending.req.amountMxn)}</strong> de{' '}
            <strong className="text-white">{pending.req.clientName}</strong>.
            {pending.status === 'APROBADA' && (
              <p className="mt-2 text-xs text-slate-400">
                Al aprobar, el saldo del cliente se ajustará automáticamente.
              </p>
            )}
          </>
        )}
      </ConfirmDialog>
    </div>
  );
}
