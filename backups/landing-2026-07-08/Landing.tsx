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
      <header className="sticky top-0 z-40 border-b border-ink-600/60 bg-ink-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <a href="#top" className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 font-bold text-white">
              B
            </span>
            <span className="text-lg font-semibold text-white">Broker.mx</span>
          </a>
          <nav className="hidden items-center gap-6 text-sm text-slate-300 md:flex">
            <a href="#quienes" className="hover:text-white">
              Quiénes Somos
            </a>
            <a href="#noticias" className="hover:text-white">
              Mercados
            </a>
            <a href="#noticias" className="hover:text-white">
              Noticias
            </a>
            <a href="#testimonios" className="hover:text-white">
              Testimonios
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <Link
              to="/login"
              className="btn-ghost inline-flex px-2 py-1.5 text-xs sm:px-4 sm:py-2 sm:text-sm"
            >
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
                <a href="#noticias" className="btn-ghost px-6 py-3 text-base">
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

        <section id="quienes" className="border-t border-ink-700/60 py-20">
          <LandingSectionHeader
            eyebrow="Nuestra firma"
            title="Quiénes Somos"
            description={
              <>
                Somos una firma legal e intermediaria especializada en la{' '}
                <strong className="text-slate-200">protección, defensa y crecimiento patrimonial</strong>{' '}
                de nuestros clientes. Combinamos asesoría profesional cercana con acceso a los mercados
                globales para que tu capital trabaje con estrategia, transparencia y respaldo.
              </>
            }
          />

          <div className="mx-auto mt-10 max-w-3xl px-4 text-center">
            <p className="text-base leading-relaxed text-slate-300 sm:text-lg">
              A lo largo de nuestra trayectoria hemos asesorado a empresarios, inversionistas y
              figuras públicas en estrategias patrimoniales con disciplina y visión de largo plazo,
              logrando resultados sólidos que se reflejan hasta el día de hoy.{' '}
              <strong className="text-white">Broker.mx: el broker en el que puede confiar.</strong>
            </p>
          </div>

          <div className="mx-auto mt-12 max-w-3xl px-4">
            <LandingSectionHeader
              className="!px-0 !text-left"
              eyebrow="Destacado del día"
              meta="Actualizado hoy · México"
              description="Titulares que ilustran la visión de inversión que compartimos con quienes confían en nuestra asesoría."
            />
            <div className="mt-6">
              <NewsCard item={SALINAS_FEATURED_NEWS} featured />
            </div>
          </div>
        </section>

        <MarketNewsSection onOpenMarket={setActiveMarket} />

        <section id="testimonios" className="border-t border-ink-700/60 bg-ink-800/30 py-20">
          <LandingSectionHeader
            className="mb-10"
            eyebrow="Confianza"
            title="Lo que dicen nuestros clientes"
            description="Resultados y experiencias reales de inversionistas mexicanos satisfechos."
          />
          <div className="mx-auto max-w-7xl px-4">
            <TestimonialsCarousel />
          </div>
        </section>

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
            Broker.mx — intermediación financiera profesional en México. Operamos con transparencia y
            conforme a la normativa aplicable.
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
