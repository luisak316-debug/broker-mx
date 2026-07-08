import { Link } from 'react-router-dom';
import { ScrollReveal } from './ScrollReveal';

export function LandingPlatforms() {
  return (
    <section id="plataformas" className="cap-section cap-section--platforms">
      <ScrollReveal>
        <div className="cap-section__inner cap-platforms-stage">
          <div className="cap-platforms-stage__copy">
            <p className="cap-eyebrow">En cualquier pantalla</p>
            <h2 className="cap-display">
              Un solo sistema.
              <span className="cap-display__accent"> Tu patrimonio, siempre contigo.</span>
            </h2>
            <p className="cap-lead">
              Múltiples dispositivos, los mismos mercados y la misma asesoría profesional en México.
              Tu infraestructura de inversión, donde estés.
            </p>

            <div className="cap-store-badges">
              <Link to="/registro" className="cap-store-badge cap-store-badge--web">
                <span className="cap-store-badge__small">Accede desde</span>
                <span className="cap-store-badge__large">Navegador web</span>
              </Link>
              <span className="cap-store-badge cap-store-badge--pwa">
                <span className="cap-store-badge__small">Disponible en</span>
                <span className="cap-store-badge__large">Móvil y tablet</span>
              </span>
              <span className="cap-store-badge cap-store-badge--desktop">
                <span className="cap-store-badge__small">Optimizado para</span>
                <span className="cap-store-badge__large">Escritorio</span>
              </span>
            </div>
          </div>

          <div className="cap-platforms-stage__visual" aria-hidden>
            <div className="cap-platforms-stage__desktop">
              <div className="cap-platforms-stage__desktop-bar">
                <span />
                <span />
                <span />
              </div>
              <div className="cap-platforms-stage__desktop-body">
                <div className="cap-platforms-stage__sidebar" />
                <div className="cap-platforms-stage__rows">
                  {['Bolsa', 'Materias', 'Forex', 'Cripto', 'Panel'].map((row) => (
                    <div key={row} className="cap-platforms-stage__row">
                      <span>{row}</span>
                      <span className="cap-platforms-stage__spark" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="cap-platforms-stage__phone">
              <div className="cap-platforms-stage__phone-notch" />
              <div className="cap-platforms-stage__phone-screen">
                <p className="cap-platforms-stage__phone-label">Cuenta MXN</p>
                <p className="cap-platforms-stage__phone-balance">$248,500</p>
                <p className="cap-platforms-stage__phone-change">+2.4% en la sesión</p>
                <div className="cap-platforms-stage__phone-cards">
                  {['Bolsa', 'Oro', 'USD/MXN', 'BTC'].map((asset) => (
                    <div key={asset} className="cap-platforms-stage__phone-card">
                      <span>{asset}</span>
                      <span className="cap-platforms-stage__phone-spark" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
