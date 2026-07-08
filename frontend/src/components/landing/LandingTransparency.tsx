import { ScrollReveal } from './ScrollReveal';

const ITEMS = [
  {
    title: 'Asesor personal asignado',
    text: 'Acompañamiento humano desde el primer depósito hasta la estrategia de tu portafolio.',
  },
  {
    title: 'Depósitos por SPEI',
    text: 'Fondea en MXN con el método que tu asesor configure: transferencia, tarjeta, ventanilla u OXXO.',
  },
  {
    title: 'Respaldo legal y transparencia',
    text: 'Procesos conforme a la normativa mexicana. Sin sorpresas en cómo operas tu cuenta.',
  },
];

export function LandingTransparency() {
  return (
    <section className="cap-section cap-section--transparency">
      <ScrollReveal>
        <div className="cap-section__inner">
          <p className="cap-eyebrow">Opera con claridad</p>
          <h2 className="cap-display">
            Estructura transparente.
            <span className="cap-display__accent"> Decisiones con respaldo.</span>
          </h2>
          <div className="cap-transparency-grid">
            {ITEMS.map((item) => (
              <article key={item.title} className="cap-transparency-card">
                <h3 className="cap-transparency-card__title">{item.title}</h3>
                <p className="cap-transparency-card__text">{item.text}</p>
              </article>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
