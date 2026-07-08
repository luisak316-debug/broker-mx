import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wakeApi } from '../api/client';
import { MarketCategoryModal } from '../components/landing/MarketCategoryModal';
import {
  MarketNewsSection,
  NewsCard,
  SALINAS_FEATURED_NEWS,
} from '../components/landing/MarketNewsSection';
import { TestimonialsCarousel } from '../components/landing/TestimonialsCarousel';
import { LandingSectionHeader } from '../components/landing/LandingSectionHeader';
import { CelebrationLink } from '../components/landing/CelebrationLink';
import { LandingGlobeCanvas } from '../components/landing/LandingGlobeCanvas';
import { LandingMarketsShowcase } from '../components/landing/LandingMarketsShowcase';
import { LandingPlatforms } from '../components/landing/LandingPlatforms';
import { LandingTransparency } from '../components/landing/LandingTransparency';
import { LandingScrollNarrative } from '../components/landing/LandingScrollNarrative';
import { ScrollReveal } from '../components/landing/ScrollReveal';
import { MARKET_CATEGORIES, type MarketCategoryId } from '../data/marketCategories';

export function Landing() {
  const [activeMarket, setActiveMarket] = useState<MarketCategoryId | null>(null);
  const selectedMarket = activeMarket
    ? MARKET_CATEGORIES.find((m) => m.id === activeMarket)
    : null;

  useEffect(() => {
    const idle = window.requestIdleCallback?.(() => wakeApi(), { timeout: 2000 });
    if (idle === undefined) {
      const t = window.setTimeout(wakeApi, 150);
      return () => window.clearTimeout(t);
    }
    return () => window.cancelIdleCallback?.(idle);
  }, []);

  return (
    <div className="cap-landing min-h-screen bg-cap-midnight text-cap-light">
      <div className="cap-trust-bar">
        <div className="cap-trust-bar__inner">
          <span>Intermediación profesional · México</span>
          <span className="cap-trust-bar__sep" aria-hidden />
          <span>Cuenta en MXN</span>
          <span className="cap-trust-bar__sep" aria-hidden />
          <span>Conforme a la normativa aplicable</span>
        </div>
      </div>

      <header className="cap-header">
        <div className="cap-header__inner">
          <a href="#top" className="cap-logo">
            <span className="cap-logo__lens" aria-hidden />
            <span className="cap-logo__text">Broker.mx</span>
          </a>
          <nav className="cap-header__nav" aria-label="Principal">
            <a href="#quienes">Quiénes Somos</a>
            <a href="#mercados">Mercados</a>
            <a href="#noticias">Noticias</a>
            <a href="#testimonios">Testimonios</a>
          </nav>
          <div className="cap-header__actions">
            <Link to="/login" className="cap-btn cap-btn--ghost cap-btn--sm">
              Iniciar Sesión
            </Link>
            <Link to="/registro" className="cap-btn cap-btn--gold cap-btn--sm">
              Crear Cuenta
            </Link>
          </div>
        </div>
      </header>

      <main id="top">
        <section className="cap-hero cap-hero--globe">
          <LandingGlobeCanvas />
          <div className="cap-hero__glow" aria-hidden />
          <div className="cap-hero__inner cap-hero__inner--globe">
            <div className="cap-hero__copy">
              <p className="cap-hero__local">Asesoría local.</p>
              <p className="cap-hero__global">
                <strong>Conexión global.</strong>
              </p>
              <p className="cap-hero__reg">
                Intermediación profesional en México · Cuenta en MXN · Conforme a la normativa aplicable
              </p>
              <p className="cap-eyebrow cap-eyebrow--hero">México · Plataforma de inversión · 4 mercados</p>
              <h1 className="cap-display cap-display--hero">
                No dejes que la inflación devore tu esfuerzo.
              </h1>
              <p className="cap-lead cap-lead--hero">
                Pon tu dinero a trabajar en los grandes mercados globales y construye la{' '}
                <strong className="text-white">libertad financiera</strong> que tu familia merece
                hoy.
              </p>
              <div className="cap-hero__cta">
                <Link to="/registro" className="cap-btn cap-btn--gold">
                  Comienza a invertir desde hoy
                </Link>
                <Link to="/login" className="cap-btn cap-btn--ghost">
                  Iniciar sesión
                </Link>
                <a href="#mercados" className="cap-btn cap-btn--ghost">
                  Ver mercados
                </a>
              </div>
              <ul className="cap-hero__trust">
                <li>Asesor personal asignado</li>
                <li>Respaldo legal</li>
                <li>Depósitos por SPEI</li>
              </ul>
            </div>
          </div>
        </section>

        <LandingMarketsShowcase onOpenMarket={setActiveMarket} />

        <LandingPlatforms />

        <LandingTransparency />

        <section id="quienes" className="cap-section cap-section--quienes">
          <ScrollReveal>
            <LandingSectionHeader
              variant="capital"
              eyebrow="Nuestra firma"
              title="Quiénes Somos"
              description={
                <>
                  Somos una firma legal e intermediaria especializada en la{' '}
                  <strong className="text-white">protección, defensa y crecimiento patrimonial</strong>{' '}
                  de nuestros clientes. Combinamos asesoría profesional cercana con acceso a los
                  mercados globales para que tu capital trabaje con estrategia, transparencia y
                  respaldo.
                </>
              }
            />
          </ScrollReveal>

          <ScrollReveal>
            <div className="cap-section__inner cap-quienes__body">
              <p className="cap-body">
                A lo largo de nuestra trayectoria hemos asesorado a empresarios, inversionistas y
                figuras públicas en estrategias patrimoniales con disciplina y visión de largo plazo,
                logrando resultados sólidos que se reflejan hasta el día de hoy.{' '}
                <strong className="text-white">Broker.mx: el broker en el que puede confiar.</strong>
              </p>
            </div>
          </ScrollReveal>

          <ScrollReveal>
            <div className="cap-section__inner">
              <LandingSectionHeader
                variant="capital"
                className="!text-left"
                eyebrow="Destacado del día"
                meta="Actualizado hoy · México"
                description="Titulares que ilustran la visión de inversión que compartimos con quienes confían en nuestra asesoría."
              />
              <div className="mt-6">
                <NewsCard item={SALINAS_FEATURED_NEWS} featured priorityImage={false} />
              </div>
            </div>
          </ScrollReveal>
        </section>

        <MarketNewsSection onOpenMarket={setActiveMarket} />

        <LandingScrollNarrative />

        <section id="testimonios" className="cap-section cap-section--testimonials">
          <ScrollReveal>
            <LandingSectionHeader
              variant="capital"
              eyebrow="Confianza"
              title="Lo que dicen nuestros clientes"
              description="Resultados y experiencias reales de inversionistas mexicanos satisfechos."
            />
          </ScrollReveal>
          <ScrollReveal>
            <div className="mx-auto max-w-7xl px-4">
              <TestimonialsCarousel />
            </div>
          </ScrollReveal>
        </section>

        <section className="cap-section cap-section--cta">
          <ScrollReveal>
            <div className="cap-cta-panel">
              <h2 className="cap-display cap-display--cta">
                Tu futuro financiero empieza con una decisión
              </h2>
              <p className="cap-lead cap-lead--cta">
                Crea tu cuenta en minutos y recibe el acompañamiento de un asesor profesional.
              </p>
              <CelebrationLink to="/registro" className="cap-btn cap-btn--gold cap-btn--lg">
                Comienza a invertir desde hoy
              </CelebrationLink>
            </div>
          </ScrollReveal>
        </section>
      </main>

      <footer className="cap-footer">
        <div className="cap-footer__inner">
          <p>
            Broker.mx — intermediación financiera profesional en México. Operamos con transparencia
            y conforme a la normativa aplicable.
          </p>
          <p>© {new Date().getFullYear()} Broker.mx · Todos los derechos reservados.</p>
        </div>
      </footer>

      {selectedMarket ? (
        <MarketCategoryModal market={selectedMarket} onClose={() => setActiveMarket(null)} />
      ) : null}
    </div>
  );
}
