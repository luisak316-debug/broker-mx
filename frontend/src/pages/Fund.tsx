import { useEffect, useState } from 'react';
import { api } from '../api/client';
import { Card } from '../components/common/Card';
import { CopyButton } from '../components/common/CopyButton';
import { DEMO_CLIENT_ID } from '../config';
import { useClientAuth } from '../auth/ClientAuthContext';
import { fmtMxn } from '../lib/format';
import type { DepositAccountInfo } from '../types';

export function Fund() {
  const { client } = useClientAuth();
  const clientId = client?.id ?? DEMO_CLIENT_ID;
  const [info, setInfo] = useState<DepositAccountInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    const load = () =>
      api.depositAccount(clientId).then(setInfo).catch((e) => setError(e.message));
    load();
    // Lee en "tiempo real" los cambios que el asesor haga desde el backoffice.
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [clientId]);

  function showToast() {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-white">Fondear Cuenta / Invertir</h1>
        <p className="text-sm text-slate-400">
          Deposita a tu cuenta asignada para comenzar a invertir.
        </p>
      </header>

      {error && <p className="text-bear">{error}</p>}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <p className="mb-4 text-sm text-slate-300">
              Para comenzar tu inversión, realiza una transferencia <strong>SPEI</strong> o depósito
              en ventanilla bancaria a la siguiente cuenta asignada:
            </p>

            {info && !info.assigned && (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
                Aún no tienes una cuenta de depósito asignada. Tu asesor la configurará en breve.
                Contáctalo si necesitas fondear de inmediato.
              </div>
            )}

            {info?.account?.initialInvestmentMxn !== undefined && (
              <div className="mb-4 flex flex-col gap-1 rounded-xl border border-brand-500/40 bg-brand-600/15 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-brand-100">
                    Monto inicial de inversión sugerido por tu asesor
                  </p>
                  <p className="text-2xl font-bold text-white">
                    {fmtMxn(info.account.initialInvestmentMxn)}
                  </p>
                </div>
                <CopyButton
                  value={String(info.account.initialInvestmentMxn)}
                  label="Copiar monto"
                  onCopied={showToast}
                />
              </div>
            )}

            {info?.account && (
              <div className="overflow-hidden rounded-xl border border-ink-600 bg-ink-900/60">
                <Field label="Beneficiario" value={info.account.beneficiary} />
                <Field label="Banco" value={info.account.bank} />
                <Field label="Número de cuenta" value={info.account.accountNumber} copy onCopied={showToast} />
                <Field label="CLABE interbancaria" value={info.account.clabe} copy mono onCopied={showToast} />
                <Field label="Referencia de pago" value={info.account.reference} copy onCopied={showToast} last />
              </div>
            )}
          </Card>

          <p className="text-xs text-slate-500">
            Verifica siempre los datos antes de transferir. Los depósitos se reflejan una vez que tu
            asesor los confirma. Nunca compartas tus credenciales de banca en línea.
          </p>
        </div>

        <Card title="¿Cómo funciona?">
          <ol className="space-y-3 text-sm text-slate-300">
            <li><span className="font-semibold text-white">1.</span> Copia los datos con el botón <em>Copiar</em>.</li>
            <li><span className="font-semibold text-white">2.</span> Abre tu banca en línea y registra la cuenta CLABE.</li>
            <li><span className="font-semibold text-white">3.</span> Realiza la transferencia SPEI incluyendo tu referencia.</li>
            <li><span className="font-semibold text-white">4.</span> Tu saldo se actualizará al confirmarse el depósito.</li>
          </ol>
        </Card>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-bull px-4 py-2 text-sm font-medium text-white shadow-lg">
          ¡Copiado con éxito para pegar en tu banca en línea!
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  copy = false,
  mono = false,
  last = false,
  onCopied,
}: {
  label: string;
  value: string;
  copy?: boolean;
  mono?: boolean;
  last?: boolean;
  onCopied?: () => void;
}) {
  return (
    <div className={`flex items-center justify-between gap-3 px-4 py-3 ${last ? '' : 'border-b border-ink-700/60'}`}>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`truncate text-white ${mono ? 'font-mono tracking-wide' : 'font-medium'}`}>{value}</p>
      </div>
      {copy && <CopyButton value={value} onCopied={onCopied} />}
    </div>
  );
}
