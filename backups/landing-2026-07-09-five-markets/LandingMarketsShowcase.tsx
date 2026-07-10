import { useState } from 'react';
import { MARKET_CATEGORIES, type MarketCategoryId } from '../../data/marketCategories';
import { LANDING_INSTRUMENTS } from '../../data/landingInstruments';
import { LandingInstrumentTicker } from './LandingInstrumentTicker';
import { ScrollReveal } from './ScrollReveal';

type Props = {
  onOpenMarket: (id: MarketCategoryId) => void;
};

export function LandingMarketsShowcase({ onOpenMarket }: Props) {
  const [active, setActive] = useState<MarketCategoryId>('stocks');
  const category = MARKET_CATEGORIES.find((m) => m.id === active)!;

  return (
    <section id="mercados" className="cap-section cap-section--markets">
      <ScrollReveal>
        <div className="cap-section__inner">
          <p className="cap-eyebrow">México · Plataforma de inversión</p>
          <h2 className="cap-display cap-display--split">
            <span>5 grandes mercados.</span>
            <span className="cap-display__accent">Un único entorno para tus decisiones.</span>
          </h2>
          <p className="cap-lead">
            Explora Bolsa, Materias Primas, Forex y Cripto con la misma cuenta, el mismo asesor y la
            misma claridad operativa.
          </p>

          <div className="cap-market-tabs" role="tablist" aria-label="Categorías de mercado">
            {MARKET_CATEGORIES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={active === m.id}
                className={`cap-market-tabs__tab${active === m.id ? ' cap-market-tabs__tab--active' : ''}`}
                onClick={() => setActive(m.id)}
              >
                {m.title}
              </button>
            ))}
          </div>

          <div className="cap-market-panel" role="tabpanel">
            <div className="cap-market-panel__head">
              <div>
                <h3 className="cap-market-panel__title">{category.title}</h3>
                <p className="cap-market-panel__desc">{category.shortDesc}</p>
              </div>
              <button
                type="button"
                className="cap-btn cap-btn--gold cap-btn--sm"
                onClick={() => onOpenMarket(active)}
              >
                Abrir simulador
              </button>
            </div>
            <LandingInstrumentTicker symbols={LANDING_INSTRUMENTS[active]} />
            <ul className="cap-market-panel__bullets">
              {category.bullets.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
