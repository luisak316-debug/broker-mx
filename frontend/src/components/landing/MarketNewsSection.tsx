import { useEffect, useState } from 'react';
import { api } from '../../api/client';
import type { MarketNewsItem } from '../../types';

const CATEGORY_STYLE: Record<string, string> = {
  featured: 'border-brand-400/50 bg-brand-600/10 text-brand-100',
  crypto: 'border-amber-500/40 bg-amber-500/10 text-amber-100',
  stocks: 'border-sky-500/40 bg-sky-500/10 text-sky-100',
  commodities: 'border-yellow-600/40 bg-yellow-600/10 text-yellow-100',
  forex: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-100',
};

function NewsCard({ item, large }: { item: MarketNewsItem; large?: boolean }) {
  const badge = CATEGORY_STYLE[item.category] ?? CATEGORY_STYLE.featured;
  return (
    <article
      className={`card flex flex-col border transition hover:border-brand-500/50 ${
        large ? 'md:col-span-2 md:row-span-2' : ''
      }`}
    >
      <span className={`mb-3 inline-flex w-fit rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badge}`}>
        {item.categoryLabel}
      </span>
      <h3 className={`font-semibold leading-snug text-white ${large ? 'text-lg' : 'text-sm'}`}>
        {item.title}
      </h3>
      <p className={`mt-2 flex-1 text-slate-400 ${large ? 'text-sm' : 'text-xs leading-relaxed'}`}>
        {item.summary}
      </p>
      <div className="mt-4 flex items-center justify-between gap-2 text-[11px] text-slate-500">
        <span>{item.source}</span>
        {item.url && item.url !== '#' ? (
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 text-brand-400 hover:underline"
          >
            Ver nota →
          </a>
        ) : null}
      </div>
    </article>
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
  const rest = items.filter((i) => i.category !== 'featured');

  return (
    <section id="noticias" className="border-t border-ink-700/60 py-20">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center text-center">
          <span className="rounded-full border border-brand-500/30 bg-brand-600/10 px-3 py-1 text-xs font-medium text-brand-200">
            Actualizado hoy
          </span>
          <h2 className="mt-3 text-3xl font-bold text-white">Noticias que impulsan tu inversión</h2>
          <p className="mt-2 max-w-2xl text-slate-400">
            Cuatro áreas de mercado — cripto, bolsa, materias primas y forex — con titulares positivos
            seleccionados cada día para motivarte a dar el siguiente paso.
          </p>
        </div>

        {loading ? (
          <div className="mt-10 grid animate-pulse grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-40 rounded-xl bg-ink-800/80" />
            ))}
          </div>
        ) : (
          <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {featured ? <NewsCard item={featured} large /> : null}
            {rest.map((item) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-[11px] text-slate-500">
          Titulares informativos de fuentes públicas. Se renuevan automáticamente cada día (hora Ciudad de México).
        </p>
      </div>
    </section>
  );
}
