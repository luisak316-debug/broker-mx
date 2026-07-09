/** Tarjetas decorativas estilo Capital.com — solo visual, sin copy del hero */
export function CapitalHeroDecorCards() {
  return (
    <div className="cap-hero-decor" aria-hidden>
      <div className="cap-hero-decor__card cap-hero-decor__card--stats">
        <p className="cap-hero-decor__label">Estadística</p>
        <svg className="cap-hero-decor__chart" viewBox="0 0 200 72" preserveAspectRatio="none">
          <polyline
            fill="none"
            stroke="rgba(148,163,184,0.35)"
            strokeWidth="1.5"
            points="0,58 28,52 56,48 84,44 112,38 140,28 168,18 200,8"
          />
          <polyline
            fill="none"
            stroke="rgba(56,189,248,0.85)"
            strokeWidth="2"
            points="0,58 28,54 56,46 84,42 112,34 140,22 168,14 200,6"
          />
        </svg>
      </div>

      <div className="cap-hero-decor__card cap-hero-decor__card--search">
        <p className="cap-hero-decor__label">Mercados en seguimiento</p>
        <ul className="cap-hero-decor__list">
          <li>
            <span>BTC/USD</span>
            <span className="cap-hero-decor__up">+1.2%</span>
          </li>
          <li>
            <span>NVDA</span>
            <span className="cap-hero-decor__up">+0.8%</span>
          </li>
          <li>
            <span>US500</span>
            <span className="cap-hero-decor__down">-0.3%</span>
          </li>
        </ul>
      </div>

      <div className="cap-hero-decor__card cap-hero-decor__card--stop">
        <div className="cap-hero-decor__row">
          <span className="cap-hero-decor__label">Stop-loss</span>
          <span className="cap-hero-decor__toggle" />
        </div>
        <div className="cap-hero-decor__field">
          <span className="cap-hero-decor__field-label">Nivel de precio</span>
          <div className="cap-hero-decor__input">
            <button type="button" tabIndex={-1}>
              −
            </button>
            <span>309.50</span>
            <button type="button" tabIndex={-1}>
              +
            </button>
          </div>
        </div>
        <div className="cap-hero-decor__meta">
          <span>Pérdida: $50.00</span>
          <span>Distancia: 2.85 (0.95%)</span>
        </div>
      </div>
    </div>
  );
}
