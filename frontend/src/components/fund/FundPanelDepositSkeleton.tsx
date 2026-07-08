import type { DepositMethod } from '../../lib/depositMethods';
import { DEPOSIT_METHOD_LABEL } from '../../lib/depositMethods';
import { DepositMethodIcon } from './DepositMethodIcon';

/** Placeholder mientras se resuelve la forma de depósito asignada por el asesor. */
export function FundPanelDepositSkeleton({ method }: { method?: DepositMethod | null }) {
  return (
    <div className="fund-panel__loading" aria-busy="true" aria-label="Cargando forma de depósito">
      <div className="fund-panel__loading-method">
        <span className="fund-panel__loading-icon" aria-hidden>
          {method ? <DepositMethodIcon method={method} /> : null}
        </span>
        <div className="fund-panel__loading-lines">
          <span className="fund-panel__loading-line fund-panel__loading-line--sm" />
          <span className="fund-panel__loading-line fund-panel__loading-line--md" />
          {method ? (
            <p className="fund-panel__loading-method-name">{DEPOSIT_METHOD_LABEL[method]}</p>
          ) : (
            <span className="fund-panel__loading-line fund-panel__loading-line--lg" />
          )}
        </div>
      </div>

      <div className="fund-panel__loading-steps" aria-hidden>
        <span className="fund-panel__loading-step" />
        <span className="fund-panel__loading-step" />
        <span className="fund-panel__loading-step" />
      </div>

      <div className="fund-panel__loading-field" aria-hidden>
        <span className="fund-panel__loading-line fund-panel__loading-line--label" />
        <span className="fund-panel__loading-input" />
      </div>

      <div className="fund-panel__loading-chips" aria-hidden>
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className="fund-panel__loading-chip" />
        ))}
      </div>

      <span className="fund-panel__loading-button" aria-hidden />
    </div>
  );
}
