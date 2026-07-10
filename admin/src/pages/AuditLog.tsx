import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import type { AuditLog as Log } from '../types';
import { fmtDateTime } from '../lib/format';

const ACTION_TONE: Record<string, string> = {
  BALANCE_UPDATE: 'bg-warn/15 text-warn',
  FUNDS_ADD: 'bg-ok/15 text-ok',
  FUNDS_REMOVE: 'bg-danger/15 text-danger',
  BONUS_GRANT: 'bg-ok/15 text-ok',
  COMMISSION_CHARGE: 'bg-warn/15 text-warn',
  CASH_REQUEST_APROBADA: 'bg-ok/15 text-ok',
  CASH_REQUEST_RECHAZADA: 'bg-danger/15 text-danger',
  DEPOSIT_ACCOUNT_ASSIGN: 'bg-brand-500/15 text-brand-100',
  DEPOSIT_ACCOUNT_UPDATE: 'bg-warn/15 text-warn',
  DOCUMENT_UPLOAD: 'bg-brand-500/15 text-brand-100',
  LOGIN: 'bg-slate-500/15 text-slate-300',
};

export function AuditLog() {
  const [logs, setLogs] = useState<Log[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.audit().then(setLogs).catch((e) => setError(e.message));
  }, []);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Bitácora de Auditoría</h1>
        <p className="text-sm text-slate-400">
          Registro inmutable de cada acción del personal interno. Seguridad y antifraude.
        </p>
      </header>

      {error && <p className="text-danger">{error}</p>}

      <Card title={`Eventos registrados (${logs.length})`}>
        {logs.length === 0 ? (
          <p className="text-sm text-slate-400">
            Aún no hay eventos. Realiza un cambio de saldo o revisa una solicitud para generarlos.
          </p>
        ) : (
          <ol className="space-y-2">
            {logs.map((l) => (
              <li key={l.id} className="rounded-lg border border-ink-700/60 bg-ink-900/40 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`badge ${ACTION_TONE[l.action] ?? 'bg-slate-500/15 text-slate-300'}`}>
                    {l.action}
                  </span>
                  <span className="text-xs text-slate-500">{fmtDateTime(l.createdAt)}</span>
                </div>
                <p className="mt-2 text-sm text-slate-200">{l.description}</p>
                <div className="mt-1 flex flex-wrap gap-x-4 text-xs text-slate-500">
                  <span>Asesor: {l.staffName}</span>
                  {l.targetUserName && <span>Cliente: {l.targetUserName}</span>}
                  {l.ipAddress && <span>IP: {l.ipAddress}</span>}
                </div>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
