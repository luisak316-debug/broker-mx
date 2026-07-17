import { useDailyMarketNews } from '../../hooks/useDailyMarketNews';
import { LandingSectionHeader } from './LandingSectionHeader';
import { NewsCard } from './MarketNewsSection';

function HeadlineChip({
  title,
  categoryLabel,
  url,
  active,
  onSelect,
}: {
  title: string;
  categoryLabel: string;
  url: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border px-3 py-2.5 text-left transition ${
        active
          ? 'border-amber-400/50 bg-amber-950/40 shadow-[0_0_20px_rgba(251,191,36,0.12)]'
          : 'border-white/10 bg-ink-950/80 hover:border-white/20 hover:bg-ink-900/90'
      }`}
    >
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-amber-200/80">
        {categoryLabel}
      </span>
      <span className="line-clamp-2 text-sm font-medium leading-snug text-slate-100">{title}</span>
      {url && url !== '#' ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="mt-1.5 inline-block text-xs font-semibold text-slate-400 hover:text-slate-200 hover:underline"
        >
          Ver nota →
        </a>
      ) : null}
    </button>
  );
}

/** Destacado del día — titulares reales Investing.com (cache 24 h, rotación cada 2 min). */
export function FeaturedDailyNews() {
  const { currentFeatured, featured, dateKey, loading, featuredIndex, setFeaturedIndex } =
    useDailyMarketNews();

  const moreHeadlines = featured.filter((_, i) => i !== featuredIndex).slice(0, 8);

  return (
    <div className="mx-auto mt-12 max-w-5xl px-4">
      <LandingSectionHeader
        className="!px-0 !text-left"
        eyebrow="Destacado del día"
        meta={
          loading
            ? 'Sincronizando con Investing.com…'
            : `Investing.com · Actualizado ${dateKey || 'hoy'} · ${featured.length} titulares · rotación cada 2 min`
        }
        description="Titulares reales del mercado — lo que sube, lo que baja y las noticias que mueven las inversiones hoy."
      />
      <div className="mt-6">
        <NewsCard item={currentFeatured} featured />
      </div>

      {moreHeadlines.length > 0 ? (
        <div className="mt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Más titulares de hoy
          </p>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {moreHeadlines.map((item) => {
              const globalIndex = featured.findIndex((f) => f.id === item.id);
              return (
                <HeadlineChip
                  key={item.id}
                  title={item.title}
                  categoryLabel={item.categoryLabel}
                  url={item.url}
                  active={false}
                  onSelect={() => {
                    if (globalIndex >= 0) setFeaturedIndex(globalIndex);
                  }}
                />
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
