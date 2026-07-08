import type { MarketCategoryInfo } from '../../data/marketCategories';
import { MarketCategoryIcon } from './MarketCategoryIcon';

const CARD_THEME: Record<
  MarketCategoryInfo['id'],
  { ring: string; label: string }
> = {
  stocks: {
    ring: 'hover:border-sky-500/30',
    label: 'group-hover:text-sky-300/90',
  },
  commodities: {
    ring: 'hover:border-amber-500/30',
    label: 'group-hover:text-amber-300/90',
  },
  forex: {
    ring: 'hover:border-emerald-500/30',
    label: 'group-hover:text-emerald-300/90',
  },
  crypto: {
    ring: 'hover:border-orange-500/30',
    label: 'group-hover:text-orange-300/90',
  },
};

type Props = {
  market: MarketCategoryInfo;
  onClick: () => void;
};

export function MarketCategoryCard({ market, onClick }: Props) {
  const theme = CARD_THEME[market.id];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group relative w-full rounded-2xl border border-ink-600/60 bg-ink-800/45 p-5 text-center transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${theme.ring} hover:border-ink-500/70 hover:bg-ink-800/70`}
    >
      <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center">
        <div className="grid h-14 w-14 place-items-center rounded-xl border border-slate-600/35 bg-ink-950/60">
          <MarketCategoryIcon id={market.id} className="h-9 w-9" />
        </div>
      </div>

      <h4 className="relative text-base font-semibold text-white">{market.title}</h4>
      <p className="relative mt-2 text-sm leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
        {market.shortDesc}
      </p>

      <p
        className={`relative mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition-colors duration-300 group-hover:text-slate-300 ${theme.label}`}
      >
        Ver simulador
        <span aria-hidden>→</span>
      </p>
    </button>
  );
}
