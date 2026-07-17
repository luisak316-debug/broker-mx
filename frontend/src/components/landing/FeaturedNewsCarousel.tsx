import { useCallback, useEffect, useRef, useState } from 'react';
import type { MarketNewsItem } from '../../types';
import { NewsCard } from './MarketNewsSection';

const AUTO_MS = 10_000;
const SWIPE_THRESHOLD = 48;

type Props = {
  items: MarketNewsItem[];
  activeIndex: number;
  onIndexChange: (index: number) => void;
};

export function FeaturedNewsCarousel({ items, activeIndex, onIndexChange }: Props) {
  const count = items.length;
  const [fade, setFade] = useState(true);
  const touchStartX = useRef<number | null>(null);
  const pauseUntil = useRef(0);

  const goTo = useCallback(
    (next: number) => {
      if (count <= 1) return;
      const wrapped = ((next % count) + count) % count;
      if (wrapped === activeIndex) return;
      setFade(false);
      window.setTimeout(() => {
        onIndexChange(wrapped);
        setFade(true);
      }, 220);
    },
    [activeIndex, count, onIndexChange],
  );

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo]);
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo]);

  useEffect(() => {
    if (count <= 1) return;
    const id = window.setInterval(() => {
      if (Date.now() < pauseUntil.current) return;
      goNext();
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [count, goNext]);

  const pauseAuto = () => {
    pauseUntil.current = Date.now() + AUTO_MS * 2;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start == null) return;
    const end = e.changedTouches[0]?.clientX ?? start;
    const delta = end - start;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    pauseAuto();
    if (delta < 0) goNext();
    else goPrev();
  };

  const current = items[activeIndex] ?? items[0];
  if (!current) return null;

  return (
    <div
      className="featured-news-carousel"
      onMouseEnter={pauseAuto}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={`featured-news-carousel__stage transition-opacity duration-300 ${
          fade ? 'opacity-100' : 'opacity-0'
        }`}
        aria-live="polite"
        aria-atomic="true"
      >
        <NewsCard item={current} featured carousel />
      </div>

      {count > 1 ? (
        <>
          <button
            type="button"
            className="featured-news-carousel__nav featured-news-carousel__nav--prev"
            onClick={() => {
              pauseAuto();
              goPrev();
            }}
            aria-label="Noticia anterior"
          >
            ‹
          </button>
          <button
            type="button"
            className="featured-news-carousel__nav featured-news-carousel__nav--next"
            onClick={() => {
              pauseAuto();
              goNext();
            }}
            aria-label="Siguiente noticia"
          >
            ›
          </button>

          <div className="featured-news-carousel__footer">
            <div className="featured-news-carousel__dots" role="tablist" aria-label="Titulares del día">
              {items.map((item, i) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={i === activeIndex}
                  aria-label={`Titular ${i + 1}: ${item.title}`}
                  className={`featured-news-carousel__dot ${i === activeIndex ? 'is-active' : ''}`}
                  onClick={() => {
                    pauseAuto();
                    goTo(i);
                  }}
                />
              ))}
            </div>
            <span className="featured-news-carousel__counter">
              {activeIndex + 1} / {count}
            </span>
          </div>
        </>
      ) : null}
    </div>
  );
}
