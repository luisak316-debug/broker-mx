import {
  MARKET_NEWS_GRID,
  SALINAS_CREDIBILITY_NEWS,
} from '../../data/marketNews.default';
import type { MarketCategoryId } from '../../data/marketCategories';
import type { MarketNewsItem } from '../../types';
import { LandingSectionHeader } from './LandingSectionHeader';
import { SimulatorButton } from './SimulatorButton';

const FALLBACK_IMAGES: Record<string, string> = {
  featured: '/news/featured.jpg',
  crypto: '/news/crypto.jpg',
  stocks: '/news/stocks.jpg',
  commodities: '/news/commodities.jpg',
  forex: '/news/forex.jpg',
};

const CARD_THEME: Record<string, { badge: string; border: string }> = {
  featured: {
    badge: 'border-violet-400/50 bg-violet-950/80 text-violet-100',
    border: 'border-violet-500/30 hover:border-violet-400/50',
  },
  crypto: {
    badge: 'border-amber-400/50 bg-amber-950/80 text-amber-100',
    border: 'border-amber-500/30 hover:border-amber-400/45',
  },
  stocks: {
    badge: 'border-sky-400/50 bg-sky-950/80 text-sky-100',
    border: 'border-sky-500/30 hover:border-sky-400/45',
  },
  commodities: {
    badge: 'border-yellow-500/45 bg-yellow-950/80 text-yellow-100',
    border: 'border-yellow-600/30 hover:border-yellow-500/45',
  },
  forex: {
    badge: 'border-emerald-400/50 bg-emerald-950/80 text-emerald-100',
    border: 'border-emerald-500/30 hover:border-emerald-400/45',
  },
};

const NEWS_TO_MARKET: Record<string, MarketCategoryId> = {
  crypto: 'crypto',
  stocks: 'stocks',
  commodities: 'commodities',
  forex: 'forex',
};

function resolveTheme(item: MarketNewsItem) {
  const key = item.themeCategory ?? item.category;
  return CARD_THEME[key] ?? CARD_THEME.featured;
}

type NewsCardProps = {
  item: MarketNewsItem;
  featured?: boolean;
  carousel?: boolean;
  onOpenSimulator?: () => void;
};

export function NewsCard({ item, featured, carousel, onOpenSimulator }: NewsCardProps) {
  const theme = resolveTheme(item);
  const imageKey = item.themeCategory ?? item.category;
  const image = item.imageUrl || FALLBACK_IMAGES[imageKey] || FALLBACK_IMAGES.featured;
  const isMarketCard = Boolean(onOpenSimulator);

  return (
    <article
      className={`group flex flex-col overflow-hidden rounded-2xl border bg-ink-950 shadow-lg transition duration-300 hover:shadow-xl ${
        featured ? 'h-auto' : 'h-full'
      } ${theme.border}`}
    >
      <div
        className={`relative overflow-hidden bg-ink-900 ${
          featured
            ? carousel
              ? 'aspect-[16/10] min-h-[220px] sm:min-h-[280px] lg:min-h-[320px]'
              : 'h-52 shrink-0 sm:h-60 lg:h-[280px]'
            : 'h-40 shrink-0 sm:h-44'
        }`}
      >
        <img
          src={image}
          alt=""
          loading={featured ? 'eager' : 'lazy'}
          decoding="async"
          fetchPriority={featured ? 'high' : 'auto'}
          className={`h-full w-full object-cover object-center transition duration-500 group-hover:scale-[1.02] ${
            carousel ? 'scale-100' : ''
          }`}
          sizes={featured ? '(min-width: 1024px) 768px, 100vw' : undefined}
          onError={(e) => {
            const img = e.currentTarget;
            const fb = FALLBACK_IMAGES[imageKey] ?? FALLBACK_IMAGES.featured;
            if (fb && !img.src.endsWith(fb)) img.src = fb;
          }}
        />
        <div
          className={`absolute inset-0 ${
            carousel
              ? 'bg-gradient-to-t from-ink-950/90 via-ink-950/15 to-transparent'
              : 'bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent'
          }`}
        />
        <span
          className={`absolute left-3 top-3 inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold ${theme.badge}`}
        >
          {item.categoryLabel}
        </span>
      </div>

      <div
        className={`flex shrink-0 flex-col p-4 sm:p-5 ${featured ? '' : 'flex-1'} ${
          isMarketCard ? 'pb-4 sm:pb-5' : ''
        }`}
      >
        <h3
          className={`font-semibold leading-snug text-white ${
            featured ? 'text-base sm:text-lg lg:text-xl' : 'text-sm sm:text-base'
          }`}
        >
          {item.title}
        </h3>
        <p
          className={`mt-2 text-slate-400 ${
            featured
              ? 'text-sm leading-relaxed'
              : 'flex-1 text-xs leading-relaxed sm:text-sm'
          }`}
        >
          {item.summary}
        </p>

        {isMarketCard ? (
          <div className="mt-4 border-t border-white/5 pt-4">
            <p className="mb-3 text-[11px] text-slate-500">{item.source}</p>
            <SimulatorButton onClick={() => onOpenSimulator?.()} />
          </div>
        ) : (
          <div
            className={`flex flex-wrap items-center justify-between gap-2 border-t border-white/5 text-[11px] text-slate-500 ${
              featured ? 'mt-3 pt-3' : 'mt-4 pt-3'
            }`}
          >
            <span className="truncate">{item.source}</span>
            {item.url && item.url !== '#' ? (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 font-semibold text-slate-400 hover:text-slate-300 hover:underline"
              >
                Ver nota →
              </a>
            ) : null}
          </div>
        )}
      </div>
    </article>
  );
}

/** Referencia de credibilidad (Ricardo Salinas Pliego). */
export const SALINAS_FEATURED_NEWS = SALINAS_CREDIBILITY_NEWS;

type Props = {
  onOpenMarket: (id: MarketCategoryId) => void;
};

export function MarketNewsSection({ onOpenMarket }: Props) {
  return (
    <section id="noticias" className="border-t border-ink-700/60 bg-ink-900/40 py-20">
      <LandingSectionHeader
        eyebrow="Qué hacemos"
        title="Acceso a las 5 grandes categorías de mercados"
        description="Conoce cada mercado a través de titulares actuales y proyecta tu inversión con el simulador, sin compromiso."
      />

      <div className="mx-auto mt-12 max-w-7xl px-4">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {MARKET_NEWS_GRID.map((item) => {
            const marketId = NEWS_TO_MARKET[item.category];
            return (
              <NewsCard
                key={item.id}
                item={item}
                onOpenSimulator={marketId ? () => onOpenMarket(marketId) : undefined}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
