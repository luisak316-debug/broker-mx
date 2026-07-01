import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { wakeApi } from '../api/client';
import { MarketCategoryModal } from '../components/landing/MarketCategoryModal';
import { MarketNewsSection } from '../components/landing/MarketNewsSection';
import { MARKET_CATEGORIES, type MarketCategoryId } from '../data/marketCategories';

const TESTIMONIALS = [
  {
    name: 'Abraham González',
    role: 'Inversionista · CDMX',
    initials: 'AG',
    text: 'Estoy muy contento. He invertido hasta el momento $200,000 MXN y mis ganancias han sido de $450,000 MXN en tan solo cuatro meses. Estoy muy agradecido.',
  },
  {
    name: 'Johana Jiménez',
    role: 'Inversionista · Guadalajara',
    initials: 'JJ',
    text: 'Excelente transparencia y el acompañamiento de mi asesor asignado me dio toda la confianza para empezar.',
  },
  {
    name: 'Griselda Barrueta',
    role: 'Inversionista · Monterrey',
    initials: 'GB',
    text: 'Por fin un broker en México que habla claro y te respalda legalmente.',
  },
];

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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-600/20 via-ink-900 to-ink-900" />
          <div className="relative mx-auto max-w-3xl px-4 py-20 text-center lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-600/10 px-3 py-1 text-xs font-medium text-brand-100">
                Firma de intermediación profesional · México
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                No dejes que la inflación devore tu esfuerzo.
              </h1>
              <p className="mx-auto mt-4 max-w-xl text-lg text-slate-300">
                Pon tu dinero a trabajar en los grandes mercados globales y construye la{' '}
                <strong className="text-white">libertad financiera</strong> que tu familia merece hoy.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/registro" className="btn-primary px-6 py-3 text-base">
                  Comienza a invertir desde hoy
                </Link>
                <Link to="/login" className="btn-ghost px-6 py-3 text-base">
                  Iniciar sesión
                </Link>
                <a href="#mercados" className="btn-ghost px-6 py-3 text-base">Ver mercados</a>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-6 text-sm text-slate-400">
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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MARKET_CATEGORIES.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setActiveMarket(m.id)}
                  className="card group w-full cursor-pointer text-center transition hover:border-brand-500/60 hover:bg-ink-700/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                >
                  <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-xl bg-brand-600/15 text-2xl transition group-hover:scale-105">
                    {m.icon}
                  </div>
                  <h4 className="font-semibold text-white">{m.title}</h4>
                  <p className="mt-1 text-sm text-slate-400">{m.shortDesc}</p>
                  <p className="mt-3 text-xs font-semibold text-brand-300 opacity-80 transition group-hover:opacity-100">
                    Ver simulador →
                  </p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <MarketNewsSection />

        {/* TESTIMONIOS */}
        <section id="testimonios" className="border-t border-ink-700/60 bg-ink-800/30 py-20">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="text-center text-3xl font-bold text-white">Lo que dicen nuestros clientes</h2>
            <p className="mt-2 text-center text-slate-400">Resultados y experiencias reales de inversionistas mexicanos.</p>
            <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
              {TESTIMONIALS.map((t) => (
                <figure key={t.name} className="card flex flex-col">
                  <div className="mb-3 flex items-center gap-3">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 font-semibold text-white">
                      {t.initials}
                    </span>
                    <figcaption>
                      <p className="font-semibold text-white">{t.name}</p>
                      <p className="text-xs text-slate-400">{t.role}</p>
                    </figcaption>
                    <span className="ml-auto text-bull">★★★★★</span>
                  </div>
                  <blockquote className="text-sm leading-relaxed text-slate-300">"{t.text}"</blockquote>
                </figure>
              ))}
            </div>
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
