import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wakeApi } from '../api/client';
import { MarketCategoryCard } from '../components/landing/MarketCategoryCard';
import { MarketCategoryModal } from '../components/landing/MarketCategoryModal';
import { MarketNewsSection } from '../components/landing/MarketNewsSection';
import { TestimonialsCarousel } from '../components/landing/TestimonialsCarousel';
import { MARKET_CATEGORIES, type MarketCategoryId } from '../data/marketCategories';

export function Landing() {
  const [activeMarket, setActiveMarket] = useState<MarketCategoryId | null>(null);
  const selectedMarket = activeMarket
    ? MARKET_CATEGORIES.find((m) => m.id === activeMarket)
    : null;

  useEffect(() => {
    wakeApi();
  }, []);

  return (
    <div className="min-h-screen bg-ink-900 text-slate-100">
      {/* Menú superior */}
      <header className="sticky top-0 z-40 border-b border-ink-600/60 bg-ink-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <a href="#top" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 font-bold text-white">B</span>
            <span className="text-lg font-semibold text-white">Broker.mx</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#quienes" className="hover:text-white">Quiénes Somos</a>
            <a href="#mercados" className="hover:text-white">Mercados</a>
            <a href="#noticias" className="hover:text-white">Noticias</a>
            <a href="#testimonios" className="hover:text-white">Testimonios</a>
          </nav>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link to="/login" className="btn-ghost inline-flex px-2 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
              <span className="sm:hidden">Entrar</span>
              <span className="hidden sm:inline">Iniciar Sesión</span>
            </Link>
            <Link to="/registro" className="btn-primary px-2 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm">
              Crear Cuenta
            </Link>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-600/20 via-ink-900/80 to-ink-900" />
          <div className="hero-aurora" aria-hidden>
            <div className="hero-aurora__orb hero-aurora__orb--sunset" />
            <div className="hero-aurora__orb hero-aurora__orb--blue" />
            <div className="hero-aurora__orb hero-aurora__orb--white" />
            <div className="hero-aurora__orb hero-aurora__orb--gold" />
          </div>
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center lg:py-28">
            <div className="hero-spotlight">
              <div className="hero-glitter" aria-hidden>
                {Array.from({ length: 14 }, (_, i) => (
                  <span key={i} className="hero-glitter__spark" />
                ))}
              </div>
              <span className="relative inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-100 shadow-[0_0_24px_rgba(251,191,36,0.25)]">
                Firma de intermediación profesional · México
              </span>
              <h1 className="hero-headline relative mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                No dejes que la inflación devore tu esfuerzo.
              </h1>
              <p className="relative mx-auto mt-4 max-w-xl text-lg text-slate-200">
                Pon tu dinero a trabajar en los grandes mercados globales y construye la{' '}
                <strong className="text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.35)]">
                  libertad financiera
                </strong>{' '}
                que tu familia merece hoy.
              </p>
              <div className="relative mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/registro" className="btn-primary px-6 py-3 text-base">
                  Comienza a invertir desde hoy
                </Link>
                <Link to="/login" className="btn-ghost px-6 py-3 text-base">
                  Iniciar sesión
                </Link>
                <a href="#mercados" className="btn-ghost px-6 py-3 text-base">
                  Ver mercados
                </a>
              </div>
              <div className="hero-trust-line relative mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-300">
                <span>✓ Asesor personal asignado</span>
                <span>✓ Respaldo legal</span>
                <span>✓ Depósitos por SPEI</span>
              </div>
            </div>
          </div>
        </section>

        {/* QUIÉNES SOMOS */}
        <section id="quienes" className="border-t border-ink-700/60 py-20">
          <div className="mx-auto max-w-5xl px-4 text-center">
            <h2 className="text-3xl font-bold text-white">Quiénes Somos</h2>
            <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-300">
              Somos una firma legal e intermediaria especializada en la{' '}
              <strong className="text-white">protección, defensa y crecimiento patrimonial</strong> de
              nuestros clientes. Combinamos asesoría profesional cercana con acceso a los mercados
              globales para que tu capital trabaje con estrategia, transparencia y respaldo.
            </p>
          </div>

          {/* 4 mercados */}
          <div id="mercados" className="mx-auto mt-14 max-w-7xl px-4">
            <h3 className="mb-2 text-center text-sm font-semibold uppercase tracking-wide text-brand-300">
              Qué hacemos
            </h3>
            <p className="mb-8 text-center text-xl font-semibold text-white">
              Acceso a las 4 grandes categorías de mercados
            </p>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {MARKET_CATEGORIES.map((m) => (
                <MarketCategoryCard key={m.id} market={m} onClick={() => setActiveMarket(m.id)} />
              ))}
            </div>
          </div>
        </section>

        <MarketNewsSection onOpenMarket={setActiveMarket} />

        {/* TESTIMONIOS */}
        <section id="testimonios" className="border-t border-ink-700/60 bg-ink-800/30 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-center text-3xl font-bold text-white">Lo que dicen nuestros clientes</h2>
            <p className="mt-2 text-center text-slate-400">
              Resultados y experiencias reales de inversionistas mexicanos satisfechos.
            </p>
            <TestimonialsCarousel />
          </div>
        </section>

        {/* CTA final */}
        <section className="py-16">
          <div className="mx-auto max-w-4xl rounded-2xl border border-brand-500/40 bg-gradient-to-r from-brand-600/20 to-ink-800 px-6 py-12 text-center">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Tu futuro financiero empieza con una decisión
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-slate-300">
              Crea tu cuenta en minutos y recibe el acompañamiento de un asesor profesional.
            </p>
            <Link to="/registro" className="btn-primary mt-6 px-6 py-3 text-base">
              Comienza a invertir desde hoy
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-ink-700/60 py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4">
          <p className="mb-2">
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
