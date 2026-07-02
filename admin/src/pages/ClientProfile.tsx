import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ClientAvatar } from '../components/ui/ClientAvatar';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useAuth } from '../auth/AuthContext';
import type { ClientProfile as Profile, DepositMethod, Transaction } from '../types';
import { CATEGORY_LABEL, DOCUMENT_TYPE_LABEL, fmtDate, fmtDateTime, fmtMxn, formatMoneyDisplay, formatMoneyInput, IDENTITY_DOCUMENT_TYPES, parseMoneyInput } from '../lib/format';
import { resolveUploadUrl } from '../lib/apiConfig';
import type { ClientDocument } from '../types';

export function ClientProfile() {
  const { id = '' } = useParams();
  const { can } = useAuth();
  const canEdit = can('ADVISOR', 'COMPLIANCE');

  const [client, setClient] = useState<Profile | null>(null);
  const [txns, setTxns] = useState<Transaction[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  // Formularios de edición crítica
  const [cashMxn, setCashMxn] = useState('');
  const [invested, setInvested] = useState('');
  const [balanceReason, setBalanceReason] = useState('');
  const [fundsOp, setFundsOp] = useState<'add' | 'remove'>('add');
  const [fundsAmount, setFundsAmount] = useState('');
  const [fundsReason, setFundsReason] = useState('');

  // Cuenta de depósito bancaria asignada
  const [depositMethod, setDepositMethod] = useState<DepositMethod>('TRANSFERENCIA');
  const [deposit, setDeposit] = useState({
    beneficiary: '',
    bank: '',
    accountNumber: '',
    clabe: '',
    reference: '',
  });
  const [initialInvestment, setInitialInvestment] = useState(''); // opcional
  const [depositBusy, setDepositBusy] = useState(false);
  const [depositError, setDepositError] = useState<string | null>(null);

  const [confirm, setConfirm] = useState<null | 'balance' | 'funds'>(null);
  const [busy, setBusy] = useState(false);

  function load() {
    api.client(id).then((c) => {
      setClient(c);
      setCashMxn(String(c.cashMxn));
      setInvested(String(c.totalInvestedMxn));
      setDeposit({
        beneficiary: c.depositAccount?.beneficiary ?? '',
        bank: c.depositAccount?.bank ?? '',
        accountNumber: c.depositAccount?.accountNumber ?? '',
        clabe: c.depositAccount?.clabe ?? '',
        reference: c.depositAccount?.reference ?? '',
      });
      setDepositMethod(
        c.depositAccount?.depositMethod ??
          (c.depositAccount?.clabe ? 'TRANSFERENCIA' : 'VENTANILLA'),
      );
      setInitialInvestment(
        c.depositAccount?.initialInvestmentMxn !== undefined
          ? formatMoneyDisplay(c.depositAccount.initialInvestmentMxn)
          : '',
      );
    }).catch((e) => setError(e.message));
    api.transactions({ userId: id }).then(setTxns).catch(() => setTxns([]));
  }

  const clabeValid = /^\d{18}$/.test(deposit.clabe);
  const accountValid = /^\d{5,20}$/.test(deposit.accountNumber);
  const depositReady =
    deposit.beneficiary.trim().length >= 3 &&
    deposit.bank.trim().length >= 2 &&
    deposit.reference.trim().length >= 1 &&
    (depositMethod === 'TRANSFERENCIA' ? clabeValid : accountValid);

  const investmentParsed = parseMoneyInput(initialInvestment);
  const investmentValid =
    initialInvestment.trim() === '' || (investmentParsed !== undefined && investmentParsed >= 0);

  async function submitDeposit() {
    setDepositBusy(true);
    setDepositError(null);
    try {
      const amount = parseMoneyInput(initialInvestment);
      await api.updateDepositAccount(id, {
        depositMethod,
        ...deposit,
        ...(amount !== undefined ? { initialInvestmentMxn: amount } : {}),
      });
      setFeedback('Cuenta de depósito guardada y registrada en la bitácora de auditoría.');
      load();
    } catch (e) {
      setDepositError(e instanceof Error ? e.message : 'Error al guardar la cuenta.');
    } finally {
      setDepositBusy(false);
    }
  }

  useEffect(load, [id]);

  useEffect(() => {
    if (!id) return;

    function refreshIdentityDocuments() {
      api
        .client(id)
        .then((c) => {
          setClient((prev) =>
            prev
              ? {
                  ...prev,
                  documents: c.documents,
                  kycStatus: c.kycStatus,
                }
              : c,
          );
        })
        .catch(() => undefined);
    }

    refreshIdentityDocuments();
    window.addEventListener('focus', refreshIdentityDocuments);
    const onVisible = () => {
      if (document.visibilityState === 'visible') refreshIdentityDocuments();
    };
    document.addEventListener('visibilitychange', onVisible);
    const interval = window.setInterval(refreshIdentityDocuments, 10_000);

    return () => {
      window.removeEventListener('focus', refreshIdentityDocuments);
      document.removeEventListener('visibilitychange', onVisible);
      window.clearInterval(interval);
    };
  }, [id]);

  useEffect(() => {
    if (window.location.hash !== '#gestion-fondos') return;
    const t = setTimeout(() => {
      document.getElementById('gestion-fondos')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
    return () => clearTimeout(t);
  }, [id, client]);

  if (error) return <p className="text-danger">{error}</p>;
  if (!client) return <p className="text-slate-400">Cargando ficha…</p>;

  const identityDocuments = client.documents.filter((d) =>
    IDENTITY_DOCUMENT_TYPES.includes(d.type as (typeof IDENTITY_DOCUMENT_TYPES)[number]),
  );

  async function submitBalance() {
    setBusy(true);
    try {
      await api.updateBalance(id, {
        cashMxn: Number(cashMxn),
        totalInvestedMxn: Number(invested),
        reason: balanceReason,
      });
      setFeedback('Saldo actualizado y registrado en la bitácora de auditoría.');
      setBalanceReason('');
      setConfirm(null);
      load();
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : 'Error al actualizar.');
    } finally {
      setBusy(false);
    }
  }

  async function submitFunds() {
    setBusy(true);
    try {
      await api.adjustFunds(id, {
        operation: fundsOp,
        amountMxn: Number(fundsAmount),
        reason: fundsReason,
      });
      setFeedback(
        `${fundsOp === 'add' ? 'Fondos agregados' : 'Fondos removidos'} y registrados en auditoría.`,
      );
      setFundsAmount('');
      setFundsReason('');
      setConfirm(null);
      load();
    } catch (e) {
      setFeedback(e instanceof Error ? e.message : 'Error al ajustar fondos.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          {client && (
            <ClientAvatar
              displayName={client.displayName}
              photoUrl={client.profilePhotoUrl}
              size="md"
            />
          )}
          <div className="min-w-0">
            <Link to="/clientes" className="text-sm text-brand-400 hover:underline">
              ← Volver a clientes
            </Link>
            <h1 className="mt-1 truncate text-2xl font-bold text-white">{client.displayName}</h1>
            <p className="text-sm text-slate-400">
              {client.id} · {client.email}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge value={client.accountStatus} />
          <Badge value={client.kycStatus} />
          {can('ADMIN', 'COMPLIANCE') && client.accountStatus === 'ACTIVA' ? (
            <button
              type="button"
              className="btn-ghost border border-danger/40 text-xs text-danger"
              onClick={async () => {
                if (!window.confirm('¿Revocar acceso de este cliente?')) return;
                try {
                  await api.updateClientAccess(id, {
                    accountStatus: 'BLOQUEADA',
                    reason: 'Acceso revocado manualmente desde administración.',
                  });
                  setFeedback('Acceso revocado. El cliente ya no podrá iniciar sesión.');
                  load();
                } catch (e) {
                  setFeedback(e instanceof Error ? e.message : 'Error al revocar acceso.');
                }
              }}
            >
              Revocar acceso
            </button>
          ) : null}
          {can('ADMIN', 'COMPLIANCE') && client.accountStatus !== 'ACTIVA' ? (
            <button
              type="button"
              className="btn-ghost border border-bull/40 text-xs text-bull"
              onClick={async () => {
                try {
                  await api.updateClientAccess(id, {
                    accountStatus: 'ACTIVA',
                    reason: 'Acceso restaurado desde administración.',
                  });
                  setFeedback('Acceso restaurado.');
                  load();
                } catch (e) {
                  setFeedback(e instanceof Error ? e.message : 'Error al restaurar acceso.');
                }
              }}
            >
              Restaurar acceso
            </button>
          ) : null}
        </div>
      </div>

      {feedback && (
        <div className="rounded-lg border border-brand-500/40 bg-brand-600/15 px-3 py-2 text-sm text-brand-100">
          {feedback}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Información personal */}
        <Card title="Información personal">
          <dl className="space-y-2 text-sm">
            <Row label="Teléfono" value={client.phone} />
            <Row label="Contraseña (registro)" value={client.plainPassword} />
            <Row label="CURP" value={client.curp} />
            <Row label="RFC" value={client.rfc} />
            <Row label="Perfil de riesgo" value={client.riskProfile} />
            <Row label="Fecha de registro" value={fmtDate(client.createdAt)} />
            <Row
              label="Última solicitud de retiro"
              value={
                client.lastWithdrawalRequestAt
                  ? fmtDateTime(client.lastWithdrawalRequestAt)
                  : 'Sin solicitudes'
              }
            />
            <Row label="Asesor asignado" value={client.advisorName} />
            <Row label="Correo del asesor" value={client.advisorEmail} />
          </dl>
        </Card>

        {/* Documentos de identidad (solo lectura — subidos por el cliente) */}
        <Card title="Documentos de identidad">
          <p className="mb-3 text-xs text-slate-400">
            Archivos que el cliente subió desde su cuenta (INE, pasaporte o constancia fiscal).
            Se actualizan automáticamente cada pocos segundos.
          </p>
          {identityDocuments.length === 0 ? (
            <p className="text-sm text-slate-400">
              El cliente aún no ha subido identificación oficial.
            </p>
          ) : (
            <ul className="space-y-2 text-sm">
              {identityDocuments.map((d) => (
                <IdentityDocumentRow key={d.id} doc={d} />
              ))}
            </ul>
          )}
        </Card>

        {/* Resumen financiero */}
        <Card title="Resumen financiero">
          <div className="space-y-3">
            <div>
              <p className="text-xs uppercase text-slate-400">Saldo disponible</p>
              <p className="text-2xl font-bold text-white">{fmtMxn(client.cashMxn)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-slate-400">Total invertido</p>
              <p className="text-xl font-semibold text-ok">{fmtMxn(client.totalInvestedMxn)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Edición crítica */}
      {canEdit ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Card title="Editar saldo / total invertido (modo crítico)">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Saldo disponible (MXN)</label>
                  <input className="input" type="number" value={cashMxn} onChange={(e) => setCashMxn(e.target.value)} />
                </div>
                <div>
                  <label className="label">Total invertido (MXN)</label>
                  <input className="input" type="number" value={invested} onChange={(e) => setInvested(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Razón del ajuste (obligatoria)</label>
                <input
                  className="input"
                  placeholder="Ej. Corrección por depósito conciliado #SPEI-2231"
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                />
              </div>
              <button
                className="btn-primary"
                disabled={balanceReason.trim().length < 5}
                onClick={() => setConfirm('balance')}
              >
                Guardar cambios
              </button>
            </div>
          </Card>

          <Card title="Agregar / remover fondos manualmente" id="gestion-fondos">
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Operación</label>
                  <select className="input" value={fundsOp} onChange={(e) => setFundsOp(e.target.value as 'add' | 'remove')}>
                    <option value="add">Agregar fondos</option>
                    <option value="remove">Remover fondos</option>
                  </select>
                </div>
                <div>
                  <label className="label">Monto (MXN)</label>
                  <input className="input" type="number" value={fundsAmount} onChange={(e) => setFundsAmount(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="label">Razón del ajuste (obligatoria)</label>
                <input
                  className="input"
                  placeholder="Ej. Bono de bienvenida autorizado por gerencia"
                  value={fundsReason}
                  onChange={(e) => setFundsReason(e.target.value)}
                />
              </div>
              <button
                className={fundsOp === 'add' ? 'btn-ok' : 'btn-danger'}
                disabled={fundsReason.trim().length < 5 || Number(fundsAmount) <= 0}
                onClick={() => setConfirm('funds')}
              >
                {fundsOp === 'add' ? 'Agregar fondos' : 'Remover fondos'}
              </button>
            </div>
          </Card>
        </div>
      ) : (
        <Card title="Edición de saldos">
          <p className="text-sm text-slate-400">
            Tu rol no tiene permisos para modificar saldos. Esta sección es de solo lectura.
          </p>
        </Card>
      )}

      {/* Cuenta de Depósito Asignada */}
      <Card
        title="Cuenta de Depósito Asignada"
        action={
          client.depositAccount?.updatedAt ? (
            <span className="text-xs text-slate-500">
              Última actualización: {fmtDate(client.depositAccount.updatedAt)}
              {client.depositAccount.updatedByName ? ` · ${client.depositAccount.updatedByName}` : ''}
            </span>
          ) : (
            <span className="text-xs text-warn">Sin cuenta asignada</span>
          )
        }
      >
        {canEdit ? (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Indica cómo debe fondear el cliente. Estos datos se muestran en tiempo real en
              &quot;Fondear Cuenta / Invertir&quot;.
            </p>
            <div>
              <label className="label">Forma de depósito del cliente</label>
              <select
                className="input"
                value={depositMethod}
                onChange={(e) => setDepositMethod(e.target.value as DepositMethod)}
              >
                <option value="TRANSFERENCIA">
                  Transferencia bancaria / SPEI (requiere CLABE interbancaria)
                </option>
                <option value="VENTANILLA">
                  Depósito en ventanilla (requiere número de cuenta)
                </option>
              </select>
              <p className="mt-1 text-xs text-slate-500">
                {depositMethod === 'TRANSFERENCIA'
                  ? 'El cliente verá la CLABE para transferencia interbancaria o SPEI desde su banca en línea o app.'
                  : 'El cliente verá el número de cuenta para depositar en sucursal bancaria en México.'}
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Razón social / Beneficiario</label>
                <input
                  className="input"
                  placeholder="Ej. Inversionistas S.A. de C.V."
                  value={deposit.beneficiary}
                  onChange={(e) => setDeposit({ ...deposit, beneficiary: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Banco receptor</label>
                <input
                  className="input"
                  placeholder="Ej. BBVA, Banamex, Santander"
                  value={deposit.bank}
                  onChange={(e) => setDeposit({ ...deposit, bank: e.target.value })}
                />
              </div>
              {depositMethod === 'VENTANILLA' ? (
                <div>
                  <label className="label">Número de cuenta (ventanilla)</label>
                  <input
                    className="input"
                    inputMode="numeric"
                    placeholder="Solo dígitos — para depósito en sucursal"
                    value={deposit.accountNumber}
                    onChange={(e) =>
                      setDeposit({ ...deposit, accountNumber: e.target.value.replace(/\D/g, '') })
                    }
                  />
                  {deposit.accountNumber && !accountValid && (
                    <p className="mt-1 text-xs text-danger">
                      El número de cuenta debe tener entre 5 y 20 dígitos.
                    </p>
                  )}
                </div>
              ) : (
                <div>
                  <label className="label">CLABE interbancaria (18 dígitos)</label>
                  <input
                    className="input"
                    inputMode="numeric"
                    maxLength={18}
                    placeholder="Para transferencia bancaria o SPEI"
                    value={deposit.clabe}
                    onChange={(e) => setDeposit({ ...deposit, clabe: e.target.value.replace(/\D/g, '') })}
                  />
                  <p className={`mt-1 text-xs ${deposit.clabe && !clabeValid ? 'text-danger' : 'text-slate-500'}`}>
                    {deposit.clabe.length}/18 dígitos
                  </p>
                </div>
              )}
              {depositMethod === 'TRANSFERENCIA' && (
                <div>
                  <label className="label">Número de cuenta (opcional)</label>
                  <input
                    className="input"
                    inputMode="numeric"
                    placeholder="Opcional — referencia adicional"
                    value={deposit.accountNumber}
                    onChange={(e) =>
                      setDeposit({ ...deposit, accountNumber: e.target.value.replace(/\D/g, '') })
                    }
                  />
                </div>
              )}
              <div>
                <label className="label">Referencia única de pago</label>
                <input
                  className="input"
                  placeholder="Ej. INV-1001"
                  value={deposit.reference}
                  onChange={(e) => setDeposit({ ...deposit, reference: e.target.value })}
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Monto inicial de inversión (MXN) · opcional</label>
                <input
                  className="input"
                  type="text"
                  inputMode="decimal"
                  placeholder="Déjalo vacío si no aplica. Ej. 10,000 o 5,000.50"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(formatMoneyInput(e.target.value))}
                />
                <p className={`mt-1 text-xs ${investmentValid ? 'text-slate-500' : 'text-danger'}`}>
                  {investmentValid
                    ? 'Si capturas un monto, el cliente lo verá en su pantalla "Fondear Cuenta".'
                    : 'El monto no puede ser negativo.'}
                </p>
              </div>
            </div>
            {depositError && (
              <p className="rounded-lg bg-danger/15 px-3 py-2 text-sm text-danger">{depositError}</p>
            )}
            <button
              className="btn-primary"
              disabled={!depositReady || !investmentValid || depositBusy}
              onClick={submitDeposit}
            >
              {depositBusy ? 'Guardando…' : 'Guardar cambios'}
            </button>
          </div>
        ) : client.depositAccount ? (
          <dl className="space-y-2 text-sm">
            <Row
              label="Forma de depósito"
              value={
                client.depositAccount.depositMethod === 'VENTANILLA'
                  ? 'Depósito en ventanilla'
                  : 'Transferencia bancaria / SPEI'
              }
            />
            <Row label="Beneficiario" value={client.depositAccount.beneficiary} />
            <Row label="Banco" value={client.depositAccount.bank} />
            {client.depositAccount.depositMethod === 'VENTANILLA' ? (
              <Row label="Número de cuenta (ventanilla)" value={client.depositAccount.accountNumber} />
            ) : (
              <>
                <Row label="CLABE interbancaria" value={client.depositAccount.clabe} />
                {client.depositAccount.accountNumber ? (
                  <Row label="Número de cuenta (opcional)" value={client.depositAccount.accountNumber} />
                ) : null}
              </>
            )}
            <Row label="Referencia" value={client.depositAccount.reference} />
            <Row
              label="Monto inicial de inversión"
              value={
                client.depositAccount.initialInvestmentMxn !== undefined
                  ? fmtMxn(client.depositAccount.initialInvestmentMxn)
                  : undefined
              }
            />
          </dl>
        ) : (
          <p className="text-sm text-slate-400">Tu rol no tiene permisos para asignar cuentas de depósito.</p>
        )}
      </Card>

      {/* Transacciones del cliente */}
      <Card title="Movimientos recientes del cliente">
        <div className="overflow-x-auto">
          <table className="table-base">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Símbolo</th>
                <th>Operación</th>
                <th className="text-right">Monto (MXN)</th>
              </tr>
            </thead>
            <tbody>
              {txns.slice(0, 15).map((t) => (
                <tr key={t.id}>
                  <td className="text-slate-300">{fmtDate(t.createdAt)}</td>
                  <td className="text-slate-300">{CATEGORY_LABEL[t.category]}</td>
                  <td className="font-medium text-white">{t.symbol}</td>
                  <td className="text-slate-300">
                    {t.side === 'buy' ? 'Compra' : 'Venta'} · {t.direction === 'long' ? 'Largo' : 'Corto'}
                  </td>
                  <td className="text-right text-slate-200">{fmtMxn(t.amountMxn)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <ConfirmDialog
        open={confirm === 'balance'}
        title="¿Confirmar cambio de saldo?"
        confirmLabel="Sí, guardar cambios"
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={submitBalance}
      >
        ¿Estás seguro de que deseas cambiar los datos financieros de{' '}
        <strong className="text-white">{client.displayName}</strong>?
        <div className="mt-2 rounded-lg bg-ink-900/60 p-2 text-xs">
          Saldo: {fmtMxn(client.cashMxn)} → <strong className="text-white">{fmtMxn(Number(cashMxn))}</strong>
          <br />
          Invertido: {fmtMxn(client.totalInvestedMxn)} →{' '}
          <strong className="text-white">{fmtMxn(Number(invested))}</strong>
        </div>
        Esta acción quedará registrada en la bitácora de auditoría.
      </ConfirmDialog>

      <ConfirmDialog
        open={confirm === 'funds'}
        title={fundsOp === 'add' ? '¿Confirmar ingreso de fondos?' : '¿Confirmar retiro de fondos?'}
        confirmLabel="Sí, continuar"
        tone={fundsOp === 'add' ? 'ok' : 'danger'}
        busy={busy}
        onCancel={() => setConfirm(null)}
        onConfirm={submitFunds}
      >
        Vas a {fundsOp === 'add' ? 'agregar' : 'remover'}{' '}
        <strong className="text-white">{fmtMxn(Number(fundsAmount) || 0)}</strong>{' '}
        {fundsOp === 'add' ? 'a' : 'de'} la cuenta de{' '}
        <strong className="text-white">{client.displayName}</strong>. Esta acción quedará
        registrada en la bitácora de auditoría.
      </ConfirmDialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-slate-400">{label}</dt>
      <dd className="text-right text-slate-200">{value ?? '—'}</dd>
    </div>
  );
}

function IdentityDocumentRow({ doc }: { doc: ClientDocument }) {
  return (
    <li className="flex flex-col gap-2 rounded-lg bg-ink-900/60 px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-slate-200">
          {DOCUMENT_TYPE_LABEL[doc.type] ?? doc.type.replace(/_/g, ' ')}
        </p>
        <p className="truncate text-xs text-slate-500">{doc.fileName}</p>
        <p className="text-xs text-slate-600">
          {fmtDateTime(doc.uploadedAt)}
          {doc.uploadedByName ? ` · ${doc.uploadedByName}` : ''}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <a
          href={resolveUploadUrl(doc.fileUrl)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-ghost px-2 py-1 text-xs"
        >
          Ver / Descargar
        </a>
        <Badge value={doc.status} />
      </div>
    </li>
  );
}
