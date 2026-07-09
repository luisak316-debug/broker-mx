import { useCallback, useMemo, useRef } from 'react';
import { useScrollFrame } from '../../hooks/useScrollFrame';
import { MARKET_CATEGORIES, type MarketCategoryId } from '../../data/marketCategories';
import {
  MARKET_SCROLL_IMAGES,
  MARKET_SCROLL_ORDER,
} from '../../data/landingMarketScroll';
import { SimulatorButton } from './SimulatorButton';

const LINES = [
  'La mayoría de los traders pierde dinero',
  'El mercado juega su papel',
  'Tus decisiones marcan la diferencia',
] as const;

const BAR_HEIGHTS = [42, 68, 35, 82, 55, 91, 48, 73, 38, 86, 52, 77, 44, 95, 58, 70, 33, 88, 61, 49, 80, 40, 74, 63, 36, 90, 47, 84];

const PHRASE_END = 0.34;
const CATEGORY_COUNT = MARKET_SCROLL_ORDER.length;

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function applyFrame(
  progress: number,
  lines: HTMLElement[],
  barsEl: HTMLElement | null,
  categoryPanels: HTMLElement[],
  marketsHeadEl: HTMLElement | null,
  categoriesEl: HTMLElement | null,
) {
  const inPhrases = progress < PHRASE_END;
  const phraseProgress = clamp01(progress / PHRASE_END);
  const catProgress = clamp01((progress - PHRASE_END) / (1 - PHRASE_END));

  if (inPhrases) {
    const step = 1 / 3;
    const activeIndex = Math.min(2, Math.floor(phraseProgress / step));
    lines.forEach((line, i) => {
      const show = i <= activeIndex;
      line.classList.toggle('trader-scroll__line--show', show);
      line.classList.toggle('trader-scroll__line--active', show && i === activeIndex);
      line.setAttribute('aria-hidden', show ? 'false' : 'true');
    });
  } else {
    lines.forEach((line) => {
      line.classList.remove('trader-scroll__line--show', 'trader-scroll__line--active');
      line.setAttribute('aria-hidden', 'true');
    });
  }

  if (marketsHeadEl) {
    let headOpacity = 0;
    if (progress >= PHRASE_END) {
      const introFadeIn = clamp01((progress - PHRASE_END) / 0.025);
      const introFadeOut = 1 - clamp01(catProgress / 0.07);
      headOpacity = introFadeIn * introFadeOut;
    }
    marketsHeadEl.classList.toggle('trader-scroll__markets-head--visible', headOpacity > 0.02);
    marketsHeadEl.style.opacity = String(headOpacity);
    marketsHeadEl.setAttribute('aria-hidden', headOpacity <= 0.02 ? 'true' : 'false');
  }

  if (categoriesEl) {
    const cardsOnly = progress >= PHRASE_END && catProgress >= 0.06;
    categoriesEl.classList.toggle('trader-scroll__categories--cards-only', cardsOnly);
  }

  if (progress >= PHRASE_END) {
    const activeCat = Math.min(CATEGORY_COUNT - 1, Math.floor(catProgress * CATEGORY_COUNT));
    const withinStep = catProgress * CATEGORY_COUNT - activeCat;

    categoryPanels.forEach((panel, i) => {
      const isActive = i === activeCat;
      panel.classList.toggle('trader-scroll__category--visible', isActive);
      if (isActive) {
        const fadeIn = clamp01(withinStep / 0.2);
        const fadeOut = withinStep > 0.78 ? clamp01((1 - withinStep) / 0.22) : 1;
        const opacity = fadeIn * fadeOut;
        panel.style.opacity = String(opacity);
        panel.style.transform = `translateY(${(1 - fadeIn) * 24}px)`;
        panel.setAttribute('aria-hidden', opacity < 0.08 ? 'true' : 'false');
      } else {
        panel.style.opacity = '0';
        panel.style.transform = 'translateY(24px)';
        panel.setAttribute('aria-hidden', 'true');
      }
    });
  } else {
    categoryPanels.forEach((panel) => {
      panel.classList.remove('trader-scroll__category--visible');
      panel.style.opacity = '0';
      panel.setAttribute('aria-hidden', 'true');
    });
  }

  if (barsEl) {
    const shift = 48 - progress * 96;
    barsEl.style.transform = `translateX(${shift}%) scaleY(${0.96 + progress * 0.08})`;
    barsEl.style.filter = `blur(${8 + progress * 22}px)`;
    barsEl.style.opacity = String(0.65 + progress * 0.3);
  }
}

type Props = {
  id?: string;
  onOpenMarket: (id: MarketCategoryId) => void;
};

/** Scrolly: 3 frases → 4 categorías con imagen, descripción y simulador */
export function LandingTraderScroll({ id = 'mercados', onOpenMarket }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLElement[]>([]);
  const barsRef = useRef<HTMLElement | null>(null);
  const categoryRefs = useRef<HTMLElement[]>([]);
  const marketsHeadRef = useRef<HTMLElement | null>(null);
  const categoriesRef = useRef<HTMLDivElement | null>(null);

  const categories = useMemo(
    () =>
      MARKET_SCROLL_ORDER.map((catId) => ({
        ...MARKET_CATEGORIES.find((m) => m.id === catId)!,
        image: MARKET_SCROLL_IMAGES[catId],
      })),
    [],
  );

  const update = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const lines = linesRef.current;
    const panels = categoryRefs.current.filter(Boolean);
    if (lines.length === 0) return;

    const headerH =
      Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue('--landing-header-h'),
      ) || 0;
    const vh = window.innerHeight - headerH;
    const scrollable = root.offsetHeight - vh;
    if (scrollable <= 0) return;

    const progress = clamp01(-root.getBoundingClientRect().top / scrollable);
    applyFrame(progress, lines, barsRef.current, panels, marketsHeadRef.current, categoriesRef.current);
  }, []);

  useScrollFrame(update);

  return (
    <div ref={rootRef} id={id} className="trader-scroll trader-scroll--markets" aria-label="Narrativa y mercados">
      <div className="trader-scroll__pin">
        <div className="trader-scroll__legend">
          {LINES.map((text, i) => (
            <p
              key={text}
              ref={(el) => {
                if (el) linesRef.current[i] = el;
              }}
              className="trader-scroll__line"
              aria-hidden="true"
            >
              {text}
            </p>
          ))}
        </div>

        <header
          ref={(el) => {
            marketsHeadRef.current = el;
          }}
          className="trader-scroll__markets-head"
        >
          <p className="trader-scroll__markets-eyebrow">Qué hacemos</p>
          <h2 className="trader-scroll__markets-title">Acceso a las 4 grandes categorías de mercados</h2>
          <p className="trader-scroll__markets-desc">
            Conoce cada mercado y proyecta tu inversión con el simulador, sin compromiso.
          </p>
        </header>

        <div
          ref={categoriesRef}
          className="trader-scroll__categories"
        >
          {categories.map((cat, i) => (
            <article
              key={cat.id}
              ref={(el) => {
                if (el) categoryRefs.current[i] = el;
              }}
              className="trader-scroll__category landing-glass-emerald"
              aria-hidden="true"
            >
              <div className="trader-scroll__category-media">
                <img
                  src={cat.image}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="trader-scroll__category-img"
                />
                <span className={`trader-scroll__category-badge ${cat.accentBg} ${cat.accentText} border ${cat.accentBorder}`}>
                  {cat.title}
                </span>
              </div>
              <div className="trader-scroll__category-body">
                <h3 className="trader-scroll__category-title">{cat.title}</h3>
                <p className="trader-scroll__category-overview">{cat.overview}</p>
                <ul className="trader-scroll__category-bullets">
                  {cat.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
                <SimulatorButton onClick={() => onOpenMarket(cat.id)} />
              </div>
            </article>
          ))}
        </div>

        <div
          ref={(el) => {
            barsRef.current = el;
          }}
          className="trader-scroll__bars"
          aria-hidden
        >
          {BAR_HEIGHTS.map((h, idx) => (
            <span
              key={idx}
              className={`trader-scroll__bar${idx % 3 !== 1 ? ' trader-scroll__bar--warm' : ''}`}
              style={{ height: `${35 + (h / 100) * 65}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
