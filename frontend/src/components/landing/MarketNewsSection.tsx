import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { DEFAULT_MARKET_NEWS } from '../../data/marketNews.default';
import type { MarketNewsItem } from '../../types';

const FALLBACK_IMAGES: Record<string, string> = {
  featured: '/news/featured.jpg',
  crypto: '/news/crypto.jpg',
  stocks: '/news/stocks.jpg',
  commodities: '/news/commodities.jpg',
  forex: '/news/forex.jpg',
};

const CARD_THEME: Record<string, { badge: string; border: string; icon: string }> = {
  featured: {
    badge: 'border-violet-400/60 bg-violet-600/80 text-white backdrop-blur-sm',
    border: 'border-violet-500/40 hover:border-violet-400/70',
    icon: '⭐',
  },
  crypto: {
    badge: 'border-amber-400/60 bg-amber-600/80 text-white backdrop-blur-sm',
    border: 'border-amber-500/35 hover:border-amber-400/60',
    icon: '₿',
  },
  stocks: {
    badge: 'border-sky-400/60 bg-sky-600/80 text-white backdrop-blur-sm',
    border: 'border-sky-500/35 hover:border-sky-400/60',
    icon: '📈',
  },
  commodities: {
    badge: 'border-yellow-500/60 bg-yellow-700/80 text-white backdrop-blur-sm',
    border: 'border-yellow-600/35 hover:border-yellow-500/60',
    icon: '🥇',
  },
  forex: {
    badge: 'border-emerald-400/60 bg-emerald-600/80 text-white backdrop-blur-sm',
    border: 'border-emerald-500/35 hover:border-emerald-400/60',
    icon: '💱',
  },
};

function NewsCard({ item, featured }: { item: MarketNewsItem; featured?: boolean }) {
  const theme = CARD_THEME[item.category] ?? CARD_THEME.featured;
  const image =
    item.imageUrl || FALLBACK_IMAGES[item.category] || FALLBACK_IMAGES.featured;

  return (
    <article
      className={`group flex h-full flex-col overflow-hidden rounded-2xl border bg-ink-950 shadow-xl transition duration-300 hover:shadow-2xl ${theme.border}`}
    >
      <div
        className={`relative shrink-0 overflow-hidden ${
          featured ? 'h-52 sm:h-60 lg:h-72 xl:h-80' : 'h-40 sm:h-44'
        }`}
      >
        <img
          src={image}
          alt=""
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            const img = e.currentTarget;
            const fb = FALLBACK_IMAGES[item.category] ?? FALLBACK_IMAGES.featured;
            if (fb && img.src !== fb) img.src = fb;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/50 to-transparent" />
        <span
          className={`absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold shadow-lg ${theme.badge}`}
        >
          <span aria-hidden>{theme.icon}</span>
          {item.categoryLabel}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4 sm:p-5">
        <h3
          className={`font-semibold leading-snug text-white ${
            featured ? 'text-base sm:text-lg lg:text-xl' : 'text-sm sm:text-base'
          }`}
        >
          {item.title}
        </h3>
        <p
          className={`mt-2 flex-1 text-slate-400 ${
            featured ? 'text-sm leading-relaxed' : 'text-xs leading-relaxed sm:text-sm'
          }`}
        >
          {item.summary}
        </p>
        <div className="mt-4 flex items-center justify-between gap-2 border-t border-white/5 pt-3 text-[11px] text-slate-500">
          <span className="truncate">{item.source}</span>
          {item.url && item.url !== '#' ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 font-semibold text-brand-300 hover:text-brand-200 hover:underline"
            >
              Ver nota →
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function NewsGrid({ items }: { items: MarketNewsItem[] }) {
  const featured = items.find((i) => i.category === 'featured');
  const markets = items.filter((i) => i.category !== 'featured');

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:items-stretch">
      {featured ? (
        <div className="lg:min-h-[520px]">
          <NewsCard item={featured} featured />
        </div>
      ) : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {markets.map((item) => (
          <NewsCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}

export function MarketNewsSection() {
  const [items, setItems] = useState<MarketNewsItem[]>(DEFAULT_MARKET_NEWS);

  useEffect(() => {
    const timer = setTimeout(() => {
      api
        .marketNews()
        .then((res) => {
          if (res.items?.length >= 5) setItems(res.items);
        })
        .catch(() => undefined);
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="noticias"
      className="relative overflow-hidden border-t border-ink-700/60 bg-gradient-to-b from-ink-950 via-ink-900 to-ink-950 py-14 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_55%)]" />

      <div className="relative mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center text-center">
          <span className="rounded-full border border-brand-400/40 bg-brand-600/15 px-4 py-1.5 text-xs font-semibold tracking-wide text-brand-100">
            Actualizado hoy · México
          </span>
          <h2 className="mt-4 text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
            Noticias que impulsan tu inversión
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-slate-400 sm:text-base">
            Titulares visuales de cripto, bolsa, materias primas y forex — en español, renovados cada
            día para motivarte a invertir con confianza.
          </p>
        </div>

        <div className="mt-10">
          <NewsGrid items={items} />
        </div>

        <div className="mt-8 flex flex-col items-center gap-2 text-center">
          <p className="flex items-center gap-2 text-[11px] text-slate-500 sm:text-xs">
            <span aria-hidden>📅</span>
            Noticias actualizadas diariamente antes de las 8:00 a.m. (hora Ciudad de México)
          </p>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-brand-500 text-sm font-bold text-white">
              B
            </span>
            BROKER.MX
          </div>
        </div>
      </div>
    </section>
  );
}
