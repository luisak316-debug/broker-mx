import { Link } from 'react-router-dom';

const MARKETS = [
  { icon: '📈', title: 'Bolsa de Valores', desc: 'Acciones de las empresas más grandes del mundo.' },
  { icon: '🛢️', title: 'Materias Primas', desc: 'Oro, plata, petróleo y commodities agrícolas.' },
  { icon: '💱', title: 'Divisas (Forex)', desc: 'Pares internacionales frente al peso mexicano.' },
  { icon: '₿', title: 'Criptomonedas', desc: 'Bitcoin, Ethereum y más, operando 24/7.' },
];

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
            <a href="#testimonios" className="hover:text-white">Testimonios</a>
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login" className="btn-ghost hidden sm:inline-flex">Iniciar Sesión</Link>
            <Link to="/registro" className="btn-primary">Crear Cuenta</Link>
          </div>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-brand-600/20 via-ink-900 to-ink-900" />
          <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 lg:grid-cols-2 lg:py-28">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-brand-600/10 px-3 py-1 text-xs font-medium text-brand-100">
                Firma de intermediación profesional · México
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
                No dejes que la inflación devore tu esfuerzo.
              </h1>
              <p className="mt-4 max-w-xl text-lg text-slate-300">
                Pon tu dinero a trabajar en los grandes mercados globales y construye la{' '}
                <strong className="text-white">libertad financiera</strong> que tu familia merece hoy.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/registro" className="btn-primary px-6 py-3 text-base">
                  Comienza a invertir desde hoy
                </Link>
                <a href="#mercados" className="btn-ghost px-6 py-3 text-base">Ver mercados</a>
              </div>
              <div className="mt-8 flex flex-wrap gap-6 text-sm text-slate-400">
                <span>✓ Asesor personal asignado</span>
                <span>✓ Respaldo legal</span>
                <span>✓ Depósitos por SPEI</span>
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl border border-ink-600 bg-ink-800/70 p-6 shadow-2xl">
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-slate-400">Tu portafolio</p>
                  <span className="badge bg-bull/15 text-bull">+18.4%</span>
                </div>
                <p className="text-3xl font-bold text-white">$650,000 <span className="text-base text-slate-400">MXN</span></p>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  {MARKETS.map((m) => (
                    <div key={m.title} className="rounded-lg bg-ink-900/60 p-3">
                      <div className="text-xl">{m.icon}</div>
                      <p className="mt-1 text-xs text-slate-300">{m.title}</p>
                    </div>
                  ))}
                </div>
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
              {MARKETS.map((m) => (
                <div key={m.title} className="card text-center transition hover:border-brand-500/60">
                  <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-xl bg-brand-600/15 text-2xl">
                    {m.icon}
                  </div>
                  <h4 className="font-semibold text-white">{m.title}</h4>
                  <p className="mt-1 text-sm text-slate-400">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

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
            Entorno de simulación / intermediación financiera profesional. Invertir implica riesgos,
            incluida la posible pérdida de capital. No constituye asesoría de inversión.
          </p>
          <p>© {new Date().getFullYear()} Broker.mx · Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
