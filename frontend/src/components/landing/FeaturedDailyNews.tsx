import { useDailyMarketNews } from '../../hooks/useDailyMarketNews';
import { LandingSectionHeader } from './LandingSectionHeader';
import { NewsCard } from './MarketNewsSection';

/** Destacado del día — Salinas + titulares Investing.com (rotación cada 2 min, cache 24 h). */
export function FeaturedDailyNews() {
  const { currentFeatured, dateKey, loading } = useDailyMarketNews();

  return (
    <div className="mx-auto mt-12 max-w-3xl px-4">
      <LandingSectionHeader
        className="!px-0 !text-left"
        eyebrow="Destacado del día"
        meta={
          loading
            ? 'Sincronizando con Investing.com…'
            : `Investing.com · Actualizado ${dateKey || 'hoy'} · rotación cada 2 min`
        }
        description="Titulares reales del mercado — lo que sube, lo que baja y las noticias que mueven las inversiones hoy."
      />
      <div className="mt-6">
        <NewsCard item={currentFeatured} featured />
      </div>
    </div>
  );
}
