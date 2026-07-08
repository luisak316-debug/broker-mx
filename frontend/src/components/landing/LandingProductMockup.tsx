/** Mockup visual del panel de inversión para el hero (estilo Capital.com). */
export function LandingProductMockup() {
  return (
    <div className="cap-mockup" aria-hidden>
      <div className="cap-mockup__chrome">
        <span className="cap-mockup__dot" />
        <span className="cap-mockup__dot" />
        <span className="cap-mockup__dot" />
        <span className="cap-mockup__title">Mi panel de inversión</span>
      </div>
      <div className="cap-mockup__body">
        <div className="cap-mockup__stats">
          <div className="cap-mockup__stat cap-mockup__stat--primary">
            <p className="cap-mockup__stat-label">Patrimonio total</p>
            <p className="cap-mockup__stat-value">$248,500</p>
            <p className="cap-mockup__stat-change">+2.4% en la sesión</p>
          </div>
          <div className="cap-mockup__stat">
            <p className="cap-mockup__stat-label">Invertido</p>
            <p className="cap-mockup__stat-value cap-mockup__stat-value--sm">$186,200</p>
          </div>
        </div>
        <div className="cap-mockup__chart">
          <svg viewBox="0 0 320 120" className="cap-mockup__chart-svg" preserveAspectRatio="none">
            <defs>
              <linearGradient id="capMockGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(201,169,98,0.35)" />
                <stop offset="100%" stopColor="rgba(201,169,98,0)" />
              </linearGradient>
            </defs>
            <path
              d="M0,95 C40,88 60,72 100,68 C140,64 180,48 220,42 C260,36 290,28 320,18 L320,120 L0,120 Z"
              fill="url(#capMockGrad)"
            />
            <path
              d="M0,95 C40,88 60,72 100,68 C140,64 180,48 220,42 C260,36 290,28 320,18"
              fill="none"
              stroke="#C9A962"
              strokeWidth="2"
            />
          </svg>
        </div>
        <div className="cap-mockup__segments">
          <span className="cap-mockup__seg">Bolsa</span>
          <span className="cap-mockup__seg">Materias</span>
          <span className="cap-mockup__seg">Forex</span>
          <span className="cap-mockup__seg">Cripto</span>
        </div>
      </div>
    </div>
  );
}
