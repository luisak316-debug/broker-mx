import type { MarketCategoryInfo } from '../../data/marketCategories';
import { MarketCategoryIcon } from './MarketCategoryIcon';

const CARD_THEME: Record<
  MarketCategoryInfo['id'],
  { glow: string; ring: string; gradient: string; label: string }
> = {
  stocks: {
    glow: 'group-hover:shadow-[0_0_40px_rgba(56,189,248,0.35)]',
    ring: 'group-hover:border-sky-400/50',
    gradient: 'from-sky-500/20 via-indigo-500/10 to-cyan-400/5',
    label: 'group-hover:text-sky-300',
  },
  commodities: {
    glow: 'group-hover:shadow-[0_0_40px_rgba(251,191,36,0.35)]',
    ring: 'group-hover:border-amber-400/50',
    gradient: 'from-amber-500/20 via-yellow-500/10 to-orange-600/5',
    label: 'group-hover:text-amber-300',
  },
  forex: {
    glow: 'group-hover:shadow-[0_0_40px_rgba(52,211,153,0.35)]',
    ring: 'group-hover:border-emerald-400/50',
    gradient: 'from-emerald-500/20 via-teal-500/10 to-green-400/5',
    label: 'group-hover:text-emerald-300',
  },
  crypto: {
    glow: 'group-hover:shadow-[0_0_40px_rgba(168,85,247,0.35)]',
    ring: 'group-hover:border-violet-400/50',
    gradient: 'from-orange-500/15 via-amber-400/10 to-violet-500/15',
    label: 'group-hover:text-violet-300',
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
      className={`market-category-card group relative w-full overflow-hidden rounded-2xl border border-ink-600/60 bg-ink-800/50 p-5 text-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${theme.glow} ${theme.ring} hover:-translate-y-1.5 hover:bg-ink-800/80`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100 ${theme.gradient}`}
        aria-hidden
      />
      <div
        className="market-category-card__scan pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-white/5 opacity-0 blur-md transition-all duration-500 group-hover:scale-125 group-hover:opacity-100" />
        <div className="relative grid h-16 w-16 place-items-center rounded-2xl border border-white/10 bg-ink-900/60 shadow-inner transition-all duration-500 group-hover:scale-110 group-hover:border-white/20 group-hover:shadow-lg">
          <MarketCategoryIcon id={market.id} className="h-11 w-11 transition-transform duration-500 group-hover:scale-110" />
        </div>
      </div>

      <h4 className="relative text-base font-semibold text-white transition-colors duration-300">
        {market.title}
      </h4>
      <p className="relative mt-2 text-sm leading-relaxed text-slate-400 transition-colors duration-300 group-hover:text-slate-300">
        {market.shortDesc}
      </p>

      <p
        className={`relative mt-4 inline-flex items-center gap-1 text-xs font-semibold text-brand-300 opacity-80 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 ${theme.label}`}
      >
        Ver simulador
        <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
      </p>
    </button>
  );
}
