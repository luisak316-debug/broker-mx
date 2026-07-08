import { fmtMxn } from '../../lib/format';
import { FundCelebrationButton } from '../layout/FundNavLink';

type Props = {
  amountMxn?: number | null;
  onViewInvestment: () => void;
};

/** Confirmación unificada tras registrar un depósito (los 4 métodos). */
export function DepositSuccessPanel({ amountMxn, onViewInvestment }: Props) {
  return (
    <div className="fund-panel__success fund-panel__success--registered">
      <div className="fund-panel__success-icon" aria-hidden>
        ✓
      </div>
      <h3 className="text-lg font-semibold text-white">Depósito registrado</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        Recibimos tu aviso de depósito. Tu asesor lo confirmará y acreditará tu saldo en breve.
      </p>
      {amountMxn != null && amountMxn > 0 ? (
        <p className="mt-3 text-2xl font-bold text-brand-100">{fmtMxn(amountMxn)}</p>
      ) : null}
      <FundCelebrationButton className="mt-5 w-full" onClick={onViewInvestment}>
        Ver mi panel de inversión
      </FundCelebrationButton>
    </div>
  );
}
