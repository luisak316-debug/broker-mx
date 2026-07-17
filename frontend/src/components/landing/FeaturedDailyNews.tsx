import { useDailyMarketNews } from '../../hooks/useDailyMarketNews';
import { LandingSectionHeader } from './LandingSectionHeader';
import { FeaturedNewsCarousel } from './FeaturedNewsCarousel';

/** Destacado del día — carrusel Investing.com (imagen + texto en una tarjeta). */
export function FeaturedDailyNews() {
  const { featured, dateKey, loading, featuredIndex, setFeaturedIndex } = useDailyMarketNews();

  return (
    <div className="mx-auto mt-12 max-w-3xl px-4">
      <LandingSectionHeader
        className="!px-0 !text-left"
        eyebrow="Destacado del día"
        meta={
          loading
            ? 'Sincronizando con Investing.com…'
            : `Investing.com · Actualizado ${dateKey || 'hoy'} · ${featured.length} titulares · carrusel automático`
        }
        description="Titulares reales del mercado — lo que sube, lo que baja y las noticias que mueven las inversiones hoy."
      />
      <div className="mt-6">
        {loading && featured.length === 0 ? (
          <div className="featured-news-carousel__skeleton h-[420px] animate-pulse rounded-2xl border border-white/10 bg-ink-950/80 sm:h-[460px]" />
        ) : (
          <FeaturedNewsCarousel
            items={featured}
            activeIndex={featuredIndex}
            onIndexChange={setFeaturedIndex}
          />
        )}
      </div>
    </div>
  );
}
