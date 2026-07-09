import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Card } from '../common/Card';
import { DepositSuccessPanel } from './DepositSuccessPanel';
import { DepositMethodIcon } from './DepositMethodIcon';
import { FundPanelDepositSkeleton } from './FundPanelDepositSkeleton';
import { CopyButton } from '../common/CopyButton';
import { useClientAuth } from '../../auth/ClientAuthContext';
import { useClientMoney } from '../../lib/clientMoney';
import {
  readDepositAccountCache,
  writeDepositAccountCache,
} from '../../lib/depositAccountCache';
import {
  requestInvestmentScroll,
  INVESTMENT_READY_EVENT,
  scrollToInvestmentPanel,
} from '../../lib/investmentScroll';
import {
  cashRequestMethod,
  confirmDepositLabel,
  DEPOSIT_METHOD_LABEL,
  depositInstructions,
} from '../../lib/depositMethods';
import type { DepositAccountInfo, DepositMethod } from '../../types';

const QUICK_AMOUNTS = [5_000, 10_000, 25_000, 50_000, 100_000];

type WizardStep = 1 | 2 | 3;

function parseAmount(raw: string): number | null {
  const amountMxn = Number(raw.replace(/,/g, '').trim());
  if (!Number.isFinite(amountMxn) || amountMxn <= 0) return null;
  return amountMxn;
}

function buildCopyAllText(
  info: DepositAccountInfo,
  method: DepositMethod,
  formatMoney: (amount: number) => string,
  amountMxn?: number,
): string {
  const acc = info.account;
  if (!acc) return '';
  const lines = ['Depósito Broker.mx', `Método: ${DEPOSIT_METHOD_LABEL[method]}`, `Beneficiario: ${acc.beneficiary}`];

  if (method === 'OXXO') {
    lines.push(`Red: ${acc.bank}`, `Referencia OXXO: ${acc.accountNumber}`);
  } else if (method === 'VENTANILLA') {
    lines.push(`Banco: ${acc.bank}`, `Cuenta: ${acc.accountNumber}`);
  } else if (method === 'TARJETA') {
    lines.push(`Procesador: ${acc.bank}`);
    if (acc.accountNumber) lines.push(`Enlace: ${acc.accountNumber}`);
  } else {
    lines.push(`Banco: ${acc.bank}`, `CLABE: ${acc.clabe}`);
    if (acc.accountNumber) lines.push(`Cuenta (ref.): ${acc.accountNumber}`);
  }

  lines.push(`Referencia: ${acc.reference}`);
  if (amountMxn) lines.push(`Monto: ${formatMoney(amountMxn)}`);
  return lines.join('\n');
}

type Props = {
  showWithdraw?: boolean;
  embedded?: boolean;
};

export function FundAccountPanel({ showWithdraw = true, embedded = false }: Props) {
  const { client } = useClientAuth();
  const { format: formatMoney, currency } = useClientMoney();
  const clientId = client?.id;

  const cachedInfo = clientId ? readDepositAccountCache(clientId) : null;

  const [info, setInfo] = useState<DepositAccountInfo | null>(cachedInfo);
  const [infoLoading, setInfoLoading] = useState(!cachedInfo);
  const [cashMxn, setCashMxn] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState(false);

  const [step, setStep] = useState<WizardStep>(1);
  const [amount, setAmount] = useState('');
  const [depositNote, setDepositNote] = useState('');
  const [depositBusy, setDepositBusy] = useState(false);
  const [depositMsg, setDepositMsg] = useState<string | null>(null);
  const [depositSuccess, setDepositSuccess] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawNote, setWithdrawNote] = useState('');
  const [payoutBank, setPayoutBank] = useState('');
  const [payoutOwnerName, setPayoutOwnerName] = useState('');
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawBusy, setWithdrawBusy] = useState(false);

  useEffect(() => {
    if (!clientId) return;

    let cancelled = false;

    const load = async () => {
      try {
        const data = await api.depositAccount(clientId);
        if (cancelled) return;
        setInfo(data);
        writeDepositAccountCache(clientId, data);
        setError(null);
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : 'No se pudo cargar tu forma de depósito.');
      } finally {
        if (!cancelled) setInfoLoading(false);
      }
    };

    void load();
    const id = setInterval(() => void load(), 12_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [clientId]);

  useEffect(() => {
    if (!clientId) return;
    api.portfolio(clientId).then((p) => setCashMxn(p.cashMxn)).catch(() => setCashMxn(null));
  }, [clientId, depositSuccess, withdrawSuccess]);

  const assignedMethod: DepositMethod | null = info?.account?.depositMethod ?? null;
  const hasAssignment = Boolean(info?.assigned && assignedMethod);
  const cachedMethod = cachedInfo?.account?.depositMethod ?? null;

  const parsedAmount = parseAmount(amount);
  const suggestedAmount = info?.account?.initialInvestmentMxn;
  const usesWizard = assignedMethod !== 'TARJETA';

  const copyAllValue =
    info && assignedMethod
      ? buildCopyAllText(info, assignedMethod, formatMoney, parsedAmount ?? undefined)
      : '';

  function showToast() {
    setToast(true);
    setTimeout(() => setToast(false), 2500);
  }

  function applySuggestedAmount() {
    if (suggestedAmount) setAmount(String(suggestedAmount));
  }

  function resetDepositFlow() {
    setStep(1);
    setAmount('');
    setDepositNote('');
    setDepositMsg(null);
    setDepositSuccess(false);
  }

  function goToInvestmentPanel() {
    resetDepositFlow();

    const runScroll = () => {
      window.requestAnimationFrame(() => {
        scrollToInvestmentPanel('smooth');
        window.history.replaceState(
          null,
          '',
          `${window.location.pathname}${window.location.search}#mi-inversion`,
        );
      });
    };

    if (window.location.pathname.endsWith('/fondear')) {
      runScroll();
      return;
    }

    requestInvestmentScroll();
    window.addEventListener(INVESTMENT_READY_EVENT, runScroll, { once: true });
  }

  function renderDepositSuccess() {
    return (
      <DepositSuccessPanel amountMxn={parsedAmount} onViewInvestment={goToInvestmentPanel} />
    );
  }

  async function confirmDeposit() {
    if (!clientId || !assignedMethod) return;
    const amountMxn = parsedAmount;
    if (amountMxn == null) {
      setDepositMsg('Ingresa un monto válido para invertir.');
      setDepositSuccess(false);
      return;
    }
    if (!info?.assigned) {
      setDepositMsg('Tu asesor aún no ha asignado una forma de depósito.');
      setDepositSuccess(false);
      return;
    }

    setDepositBusy(true);
    setDepositMsg(null);
    setDepositSuccess(false);
    try {
      const res = await api.requestDeposit({
        clientId,
        amountMxn,
        note: depositNote || undefined,
        method: cashRequestMethod(assignedMethod),
      });
      setDepositSuccess(true);
      setDepositMsg(res.message);
      if (usesWizard) setStep(3);
      window.dispatchEvent(new CustomEvent('brokermx:balance-updated'));
    } catch (e) {
      setDepositMsg(e instanceof Error ? e.message : 'No se pudo registrar tu depósito.');
      setDepositSuccess(false);
    } finally {
      setDepositBusy(false);
    }
  }

  function resetWithdrawForm() {
    setWithdrawAmount('');
    setWithdrawNote('');
    setPayoutBank('');
    setPayoutOwnerName('');
  }

  async function submitWithdrawal() {
    if (!clientId) return;
    const amountMxn = parseAmount(withdrawAmount);
    if (amountMxn == null) {
      setWithdrawMsg('Ingresa un monto válido.');
      setWithdrawSuccess(false);
      return;
    }
    if (payoutBank.trim().length < 2) {
      setWithdrawMsg('Indica el banco destino.');
      setWithdrawSuccess(false);
      return;
    }
    if (payoutOwnerName.trim().length < 5) {
      setWithdrawMsg('Indica el nombre completo del titular de la cuenta.');
      setWithdrawSuccess(false);
      return;
    }

    setWithdrawBusy(true);
    setWithdrawMsg(null);
    setWithdrawSuccess(false);
    try {
      await api.requestWithdrawal({
        clientId,
        amountMxn,
        note: withdrawNote || undefined,
        payoutBank: payoutBank.trim(),
        payoutOwnerName: payoutOwnerName.trim(),
      });
      resetWithdrawForm();
      setWithdrawSuccess(true);
      setWithdrawMsg('Contacta a tu asesor de inversiones.');
      window.dispatchEvent(new CustomEvent('brokermx:balance-updated'));
    } catch (e) {
      setWithdrawMsg(e instanceof Error ? e.message : 'No se pudo enviar la transacción.');
      setWithdrawSuccess(false);
    } finally {
      setWithdrawBusy(false);
    }
  }

  function renderAmountStep() {
    return (
      <div className="fund-panel__step-content">
        <label className="block">
          <span className="label">¿Cuánto deseas invertir? ({currency})</span>
          <input
            className="input fund-panel__amount-input"
            inputMode="decimal"
            placeholder="Ej. 10000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>
        <div className="fund-panel__quick-amounts">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              type="button"
              className={`fund-panel__chip ${parsedAmount === q ? 'fund-panel__chip--active' : ''}`}
              onClick={() => setAmount(String(q))}
            >
              {formatMoney(q)}
            </button>
          ))}
          {suggestedAmount ? (
            <button
              type="button"
              className="fund-panel__chip fund-panel__chip--suggested"
              onClick={applySuggestedAmount}
            >
              Sugerido {formatMoney(suggestedAmount)}
            </button>
          ) : null}
        </div>
        <button
          type="button"
          className="btn-primary mt-4 w-full"
          disabled={parsedAmount == null}
          onClick={() => setStep(2)}
        >
          Continuar al pago
        </button>
      </div>
    );
  }

  function renderBankDetails() {
    if (!info?.account || !assignedMethod) return null;
    const acc = info.account;

    return (
      <div className="overflow-hidden rounded-xl border border-ink-600 bg-ink-900/60">
        <BankField label="Beneficiario" value={acc.beneficiary} />
        {assignedMethod === 'OXXO' ? (
          <>
            <BankField label="Red de pago" value={acc.bank} />
            <BankField
              label="Número de referencia OXXO"
              value={acc.accountNumber}
              copy
              mono
              highlight
              onCopied={showToast}
            />
          </>
        ) : assignedMethod === 'VENTANILLA' ? (
          <>
            <BankField label="Banco" value={acc.bank} />
            <BankField
              label="Número de cuenta (ventanilla)"
              value={acc.accountNumber}
              copy
              mono
              highlight
              onCopied={showToast}
            />
          </>
        ) : assignedMethod === 'TARJETA' ? (
          <>
            <BankField label="Procesador de pago" value={acc.bank} />
            {acc.accountNumber ? (
              <BankField label="Enlace de pago seguro" value={acc.accountNumber} copy onCopied={showToast} />
            ) : null}
          </>
        ) : (
          <>
            <BankField label="Banco" value={acc.bank} />
            <BankField
              label="CLABE interbancaria (SPEI)"
              value={acc.clabe}
              copy
              mono
              highlight
              onCopied={showToast}
            />
            {acc.accountNumber ? (
              <BankField
                label="Número de cuenta (referencia)"
                value={acc.accountNumber}
                copy
                onCopied={showToast}
              />
            ) : null}
          </>
        )}
        <BankField
          label="Referencia de pago (obligatoria)"
          value={acc.reference}
          copy
          highlight
          last
          onCopied={showToast}
        />
      </div>
    );
  }

  function renderWizardFlow() {
    if (!assignedMethod) return null;

    if (step === 3 && depositSuccess) {
      return renderDepositSuccess();
    }

    return (
      <div className="fund-panel__wizard">
        <ol className="fund-panel__steps" aria-label="Pasos para fondear">
          <li className={step >= 1 ? 'fund-panel__step--done' : ''}>
            <span>1</span> Monto
          </li>
          <li className={step >= 2 ? 'fund-panel__step--done' : ''}>
            <span>2</span> Datos de pago
          </li>
          <li className={step >= 3 ? 'fund-panel__step--done' : ''}>
            <span>3</span> Confirmación
          </li>
        </ol>

        {step === 1 && renderAmountStep()}

        {step === 2 && (
          <div className="fund-panel__step-content">
            {parsedAmount != null && (
              <div className="fund-panel__amount-summary">
                <p>Monto a depositar</p>
                <strong>{formatMoney(parsedAmount)}</strong>
                <button type="button" className="text-sm text-brand-300 hover:underline" onClick={() => setStep(1)}>
                  Cambiar
                </button>
              </div>
            )}

            {!info?.assigned ? (
              <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
                Aún no tienes una forma de depósito asignada. Tu asesor la configurará en breve.
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-lg border border-brand-500/30 bg-brand-600/10 px-3 py-2 text-sm text-brand-100">
                  <strong className="text-white">{DEPOSIT_METHOD_LABEL[assignedMethod]}</strong>
                  <p className="mt-1 text-brand-100/90">{depositInstructions(assignedMethod)}</p>
                </div>

                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-slate-300">Copia los datos y realiza tu pago.</p>
                  {copyAllValue ? (
                    <CopyButton value={copyAllValue} label="Copiar todo" onCopied={showToast} />
                  ) : null}
                </div>

                {renderBankDetails()}

                <label className="mt-4 block">
                  <span className="label">Nota opcional</span>
                  <input
                    className="input"
                    placeholder="Ej. Pago desde sucursal Centro"
                    value={depositNote}
                    onChange={(e) => setDepositNote(e.target.value)}
                  />
                </label>

                <button
                  type="button"
                  className="btn-primary mt-4 w-full"
                  disabled={depositBusy}
                  onClick={() => void confirmDeposit()}
                >
                  {depositBusy ? 'Registrando…' : confirmDepositLabel(assignedMethod)}
                </button>
              </>
            )}

            <button
              type="button"
              className="mt-3 w-full text-sm text-slate-400 hover:text-slate-200"
              onClick={() => setStep(1)}
            >
              ← Volver al monto
            </button>
          </div>
        )}

        {step === 3 && depositSuccess ? null : (
          <>
            {depositMsg && !depositSuccess && step !== 3 && (
              <p className="mt-3 text-sm text-bear">{depositMsg}</p>
            )}
          </>
        )}
      </div>
    );
  }

  function renderCardFlow() {
    if (!assignedMethod) return null;

    if (depositSuccess) {
      return renderDepositSuccess();
    }

    return (
      <div className="fund-panel__card-flow">
        <div className="fund-panel__card-brands" aria-hidden>
          <span>VISA</span>
          <span>Mastercard</span>
          <span>AMEX</span>
        </div>

        {info?.assigned && info.account ? (
          <div className="mb-4">{renderBankDetails()}</div>
        ) : null}

        <p className="text-sm text-slate-300">
          {info?.account?.accountNumber ? (
            <>
              Usa el <strong className="text-white">enlace de pago seguro</strong> asignado por tu asesor,
              o solicita uno nuevo con el monto a invertir.
            </>
          ) : (
            <>
              Solicita un <strong className="text-white">enlace de pago seguro</strong> para pagar con
              tarjeta. Tu asesor te lo enviará por WhatsApp o correo.
            </>
          )}
        </p>

        <label className="mt-4 block">
          <span className="label">Monto a pagar con tarjeta ({currency})</span>
          <input
            className="input fund-panel__amount-input"
            inputMode="decimal"
            placeholder="Ej. 10000"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </label>

        <div className="fund-panel__quick-amounts">
          {QUICK_AMOUNTS.slice(0, 4).map((q) => (
            <button
              key={q}
              type="button"
              className={`fund-panel__chip ${parsedAmount === q ? 'fund-panel__chip--active' : ''}`}
              onClick={() => setAmount(String(q))}
            >
              {formatMoney(q)}
            </button>
          ))}
        </div>

        {info?.account?.accountNumber ? (
          <a
            href={info.account.accountNumber}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-4 flex w-full justify-center"
          >
            Abrir enlace de pago seguro
          </a>
        ) : null}

        <button
          type="button"
          className="btn-primary mt-3 w-full"
          disabled={depositBusy || parsedAmount == null}
          onClick={() => void confirmDeposit()}
        >
          {depositBusy ? 'Enviando solicitud…' : confirmDepositLabel('TARJETA')}
        </button>

        {depositMsg && !depositSuccess && <p className="mt-3 text-sm text-bear">{depositMsg}</p>}
      </div>
    );
  }

  const depositContent = (
    <div className="fund-panel">
      <div className="fund-panel__balance">
        <div>
          <p className="fund-panel__balance-label">Saldo disponible</p>
          <p className="fund-panel__balance-value">{cashMxn != null ? formatMoney(cashMxn) : '—'}</p>
        </div>
        <span className="fund-panel__balance-badge">{currency}</span>
      </div>

      {hasAssignment ? (
        <div className="fund-panel__assigned-method mb-4">
          <span className="fund-panel__assigned-method-icon" aria-hidden>
            <DepositMethodIcon method={assignedMethod!} />
          </span>
          <div>
            <p className="fund-panel__assigned-method-label">Tu forma de depósito</p>
            <p className="fund-panel__assigned-method-name">{DEPOSIT_METHOD_LABEL[assignedMethod!]}</p>
          </div>
        </div>
      ) : null}

      {infoLoading ? (
        <FundPanelDepositSkeleton method={cachedMethod ?? assignedMethod} />
      ) : !hasAssignment ? (
        <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-200">
          Tu asesor aún no ha asignado una forma de depósito. Contáctalo si necesitas fondear de
          inmediato.
        </div>
      ) : assignedMethod === 'TARJETA' ? (
        renderCardFlow()
      ) : (
        renderWizardFlow()
      )}
    </div>
  );

  if (embedded) {
    return (
      <>
        {error && <p className="mb-3 text-bear">{error}</p>}
        <Card title="Fondear e invertir" className="fund-panel-card">
          <p className="mb-4 text-sm text-slate-400">
            Deposita con la forma de pago que tu asesor configuró en tu cuenta.
          </p>
          {depositContent}
        </Card>
        {toast && <CopyToast />}
      </>
    );
  }

  return (
    <div className="space-y-6">
      {!embedded && (
        <header>
          <h1 className="text-2xl font-bold text-white">Fondear Cuenta / Invertir</h1>
          <p className="text-sm text-slate-400">Deposita con el método asignado por tu asesor.</p>
        </header>
      )}

      {error && <p className="text-bear">{error}</p>}

      <div className={`grid grid-cols-1 gap-4 ${showWithdraw ? 'lg:grid-cols-3' : ''}`}>
        <div className={showWithdraw ? 'space-y-4 lg:col-span-2' : 'space-y-4'}>
          <Card>{depositContent}</Card>
          <p className="text-xs text-slate-500">
            Verifica siempre los datos antes de pagar. Los depósitos se reflejan una vez que tu asesor
            los confirma.
          </p>
        </div>

        {showWithdraw && (
          <Card title="Retirar">
            <p className="mb-3 text-sm text-slate-400">
              Retira de tu saldo disponible indicando la cuenta bancaria destino.
            </p>
            <label className="block">
              <span className="label">Monto a retirar ({currency})</span>
              <input
                className="input"
                inputMode="decimal"
                placeholder="Ej. 5000"
                value={withdrawAmount}
                onChange={(e) => {
                  setWithdrawAmount(e.target.value);
                  setWithdrawSuccess(false);
                }}
              />
            </label>
            <label className="mt-3 block">
              <span className="label">Nota opcional</span>
              <input
                className="input"
                placeholder="Ej. Retiro parcial"
                value={withdrawNote}
                onChange={(e) => setWithdrawNote(e.target.value)}
              />
            </label>
            <label className="mt-3 block">
              <span className="label">Banco</span>
              <input
                className="input"
                placeholder="Ej. BBVA, Banorte, Santander…"
                value={payoutBank}
                onChange={(e) => setPayoutBank(e.target.value)}
              />
            </label>
            <label className="mt-3 block">
              <span className="label">Titular</span>
              <input
                className="input"
                placeholder="Nombre completo del titular de la cuenta"
                value={payoutOwnerName}
                onChange={(e) => setPayoutOwnerName(e.target.value)}
              />
            </label>
            <button
              type="button"
              className="btn-primary mt-4 w-full"
              disabled={withdrawBusy}
              onClick={() => void submitWithdrawal()}
            >
              {withdrawBusy ? 'Enviando…' : 'Enviar transacción'}
            </button>
            {withdrawMsg ? (
              <p className={`mt-3 text-sm ${withdrawSuccess ? 'font-medium text-brand-100' : 'text-bear'}`}>
                {withdrawMsg}
              </p>
            ) : null}
          </Card>
        )}
      </div>

      {toast && <CopyToast />}
    </div>
  );
}

function BankField({
  label,
  value,
  copy = false,
  mono = false,
  highlight = false,
  last = false,
  onCopied,
}: {
  label: string;
  value: string;
  copy?: boolean;
  mono?: boolean;
  highlight?: boolean;
  last?: boolean;
  onCopied?: () => void;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-3 px-4 py-3 ${
        last ? '' : 'border-b border-ink-700/60'
      } ${highlight ? 'bg-brand-600/10' : ''}`}
    >
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
        <p className={`truncate text-white ${mono ? 'font-mono tracking-wide' : 'font-medium'}`}>{value}</p>
      </div>
      {copy && <CopyButton value={value} onCopied={onCopied} />}
    </div>
  );
}

function CopyToast() {
  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-lg bg-bull px-4 py-2 text-sm font-medium text-white shadow-lg">
      ¡Copiado! Pégalo donde lo necesites.
    </div>
  );
}
