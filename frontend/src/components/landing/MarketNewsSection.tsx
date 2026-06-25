import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { MarketNewsItem } from '../../types';

const CARD_THEME: Record<
  string,
  { badge: string; border: string; glow: string; icon: string }
> = {
  featured: {
    badge: 'border-violet-400/50 bg-violet-500/15 text-violet-100',
    border: 'border-violet-500/35 hover:border-violet-400/60',
    glow: 'from-violet-600/20 via-brand-600/10 to-transparent',
    icon: '⭐',
  },
  crypto: {
    badge: 'border-amber-400/50 bg-amber-500/15 text-amber-100',
    border: 'border-amber-500/30 hover:border-amber-400/55',
    glow: 'from-amber-600/15 to-transparent',
    icon: '₿',
  },
  stocks: {
    badge: 'border-sky-400/50 bg-sky-500/15 text-sky-100',
    border: 'border-sky-500/30 hover:border-sky-400/55',
    glow: 'from-sky-600/15 to-transparent',
    icon: '📈',
  },
  commodities: {
    badge: 'border-yellow-500/50 bg-yellow-600/15 text-yellow-100',
    border: 'border-yellow-600/30 hover:border-yellow-500/55',
    glow: 'from-yellow-600/15 to-transparent',
    icon: '🥇',
  },
  forex: {
    badge: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100',
    border: 'border-emerald-500/30 hover:border-emerald-400/55',
    glow: 'from-emerald-600/15 to-transparent',
    icon: '💱',
  },
};

function NewsCard({ item, featured }: { item: MarketNewsItem; featured?: boolean }) {
  const theme = CARD_THEME[item.category] ?? CARD_THEME.featured;

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-ink-900/70 p-5 shadow-lg backdrop-blur-sm transition duration-300 ${theme.border} ${
        featured ? 'min-h-[280px] sm:min-h-[320px] lg:min-h-0' : 'min-h-[210px]'
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-br opacity-80 ${theme.glow}`}
      />
      <div className="relative flex flex-1 flex-col">
        <div className="mb-3 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${theme.badge}`}
          >
            <span aria-hidden>{theme.icon}</span>
            {item.categoryLabel}
          </span>
        </div>
        <h3
          className={`font-semibold leading-snug text-white ${
            featured ? 'text-lg sm:text-xl lg:text-2xl' : 'text-sm sm:text-base'
          }`}
        >
          {item.title}
        </h3>
        <p
          className={`mt-3 flex-1 text-slate-300/90 ${
            featured ? 'text-sm leading-relaxed sm:text-base' : 'text-xs leading-relaxed sm:text-sm'
          }`}
        >
          {item.summary}
        </p>
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-white/5 pt-4 text-[11px] text-slate-500">
          <span className="truncate">{item.source}</span>
          {item.url && item.url !== '#' ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 font-medium text-brand-300 transition group-hover:text-brand-200 hover:underline"
            >
              Ver nota →
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function LoadingGrid() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
      <div className="h-72 animate-pulse rounded-2xl bg-ink-800/80 lg:row-span-2" />
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-52 animate-pulse rounded-2xl bg-ink-800/80" />
      ))}
    </div>
  );
}

export function MarketNewsSection() {
  const [items, setItems] = useState<MarketNewsItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .marketNews()
      .then((res) => setItems(res.items))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  const featured = items.find((i) => i.category === 'featured');
  const markets = items.filter((i) => i.category !== 'featured');

  return (
    <section
      id="noticias"
      className="relative overflow-hidden border-t border-ink-700/60 bg-gradient-to-b from-ink-900 via-ink-900 to-ink-950 py-14 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.12),transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center text-center">
          <span className="rounded-full border border-brand-400/40 bg-brand-600/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-100">
            Actualizado hoy · México
          </span>
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Noticias que impulsan tu inversión
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
            Cripto, bolsa, materias primas y forex — titulares positivos en español, renovados cada
            día para motivarte a invertir con confianza.
          </p>
        </div>

        <div className="mt-10">
          {loading ? (
            <LoadingGrid />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
              {featured ? (
                <div className="sm:col-span-2 lg:col-span-1 lg:row-span-2">
                  <NewsCard item={featured} featured />
                </div>
              ) : null}
              {markets.map((item) => (
                <NewsCard key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>

        <p className="mt-8 text-center text-[11px] leading-relaxed text-slate-500 sm:text-xs">
          Titulares informativos de fuentes públicas · Se renuevan automáticamente cada día (hora
          Ciudad de México)
        </p>
      </div>
    </section>
  );
}
