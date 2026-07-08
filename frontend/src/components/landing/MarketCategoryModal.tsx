import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  INVESTMENT_AMOUNTS_MXN,
  INVESTMENT_HORIZONS_MONTHS,
  type MarketCategoryInfo,
} from '../../data/marketCategories';
import { fmtMxn, fmtPct } from '../../lib/format';
import { projectInvestment } from '../../utils/investmentSimulator';

type Props = {
  market: MarketCategoryInfo;
  onClose: () => void;
};

export function MarketCategoryModal({ market, onClose }: Props) {
  const [amountMxn, setAmountMxn] = useState<number>(INVESTMENT_AMOUNTS_MXN[0]);
  const [months, setMonths] = useState<number>(INVESTMENT_HORIZONS_MONTHS[0]);

  const projection = useMemo(
    () => projectInvestment(amountMxn, market.annualReturnPct, months),
    [amountMxn, market.annualReturnPct, months],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="market-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-ink-950/80 backdrop-blur-sm"
        aria-label="Cerrar ventana"
        onClick={onClose}
      />

      <div
        className={`relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-2xl border bg-ink-900 shadow-2xl ${market.accentBorder}`}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full border border-white/10 bg-ink-800/90 text-slate-300 transition hover:border-white/25 hover:text-white"
          aria-label="Cerrar"
        >
          ✕
        </button>

        <div className={`border-b border-white/5 px-5 pb-4 pt-5 ${market.accentBg}`}>
          <div className="pr-10">
            <p className={`text-xs font-semibold uppercase tracking-wide ${market.accentText}`}>
              Simulador de inversión
            </p>
            <h2 id="market-modal-title" className="mt-1 text-xl font-bold text-white">
              {market.title}
            </h2>
          </div>
        </div>

        <div className="space-y-5 p-5">
          <p className="text-sm leading-relaxed text-slate-300">{market.overview}</p>
          <ul className="space-y-2 text-sm text-slate-400">
            {market.bullets.map((bullet) => (
              <li key={bullet} className="flex gap-2">
                <span className={`mt-0.5 shrink-0 ${market.accentText}`}>✓</span>
                <span>{bullet}</span>
              </li>
            ))}
          </ul>

          <div className="rounded-xl border border-white/10 bg-ink-950/60 p-4">
            <h3 className="text-sm font-semibold text-white">Simula tu rendimiento</h3>
            <p className="mt-1 text-xs text-slate-500">
              Proyección con rendimiento histórico promedio anual de{' '}
              <strong className="text-slate-300">{market.annualReturnPct}%</strong> (referencia
              ilustrativa).
            </p>

            <div className="mt-4">
              <p className="text-xs font-medium text-slate-400">Monto a invertir</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {INVESTMENT_AMOUNTS_MXN.map((amount) => (
                  <button
                    key={amount}
                    type="button"
                    onClick={() => setAmountMxn(amount)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      amountMxn === amount
                        ? 'border-brand-400 bg-brand-600/20 text-white'
                        : 'border-white/10 bg-ink-800 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    {fmtMxn(amount)}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4">
              <p className="text-xs font-medium text-slate-400">Horizonte</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {INVESTMENT_HORIZONS_MONTHS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMonths(m)}
                    className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                      months === m
                        ? 'border-brand-400 bg-brand-600/20 text-white'
                        : 'border-white/10 bg-ink-800 text-slate-300 hover:border-white/20'
                    }`}
                  >
                    {m} {m === 1 ? 'mes' : 'meses'}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-lg bg-ink-800/80 p-3">
                <p className="text-[11px] text-slate-500">Ganancia estimada</p>
                <p className="mt-1 text-lg font-bold text-bull">+{fmtMxn(projection.profitMxn)}</p>
              </div>
              <div className="rounded-lg bg-ink-800/80 p-3">
                <p className="text-[11px] text-slate-500">Total proyectado</p>
                <p className="mt-1 text-lg font-bold text-white">{fmtMxn(projection.totalMxn)}</p>
              </div>
              <div className="rounded-lg bg-ink-800/80 p-3">
                <p className="text-[11px] text-slate-500">Rendimiento</p>
                <p className="mt-1 text-lg font-bold text-brand-300">
                  +{fmtPct(projection.returnPct)}
                </p>
              </div>
            </div>

            <p className="mt-3 text-[10px] leading-relaxed text-slate-500">
              Simulación ilustrativa con interés compuesto mensual. Los mercados financieros
              implican riesgo; no garantiza resultados futuros. Tu asesor personaliza la estrategia
              según tu perfil.
            </p>
          </div>

          <Link
            to="/registro"
            className="btn-primary block w-full py-3 text-center text-sm font-semibold"
            onClick={onClose}
          >
            Crear cuenta e invertir en {market.title.split(' ')[0]} →
          </Link>
        </div>
      </div>
    </div>
  );
}
