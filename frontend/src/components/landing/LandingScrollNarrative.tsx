import { useEffect, useMemo, useRef, useState } from 'react';

const LEGEND_LINES = [
  'La mayoría de los inversionistas pierde dinero',
  'El mercado juega su papel',
  'Tus decisiones marcan la diferencia',
] as const;

const CALM_STEPS = [
  'Define cuánto invertir antes de operar',
  'Elige en qué mercado participar con tu asesor',
  'Confirma cada paso con claridad',
] as const;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

function segmentOpacity(progress: number, start: number, end: number): number {
  if (progress <= start) return 0;
  if (progress >= end) return 1;
  return (progress - start) / (end - start);
}

type BarSpec = {
  height: number;
  warm: boolean;
  blur: number;
};

export function LandingScrollNarrative() {
  const sectionRef = useRef<HTMLElement>(null);
  const [progress, setProgress] = useState(0);
  const [staticMode, setStaticMode] = useState(false);

  const bars = useMemo<BarSpec[]>(() => {
    const seed = [42, 68, 35, 82, 55, 91, 48, 73, 38, 86, 52, 77, 44, 95, 58, 70, 33, 88, 61, 49, 80, 40, 74, 63, 36, 90, 47, 84];
    return seed.map((h, i) => ({
      height: 0.35 + (h / 100) * 0.65,
      warm: i % 3 !== 1,
      blur: 6 + (i % 5) * 3,
    }));
  }, []);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setStaticMode(true);
      return;
    }

    const section = sectionRef.current;
    if (!section) return;

    const update = () => {
      const rect = section.getBoundingClientRect();
      const scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        setProgress(0);
        return;
      }
      const scrolled = Math.min(scrollable, Math.max(0, -rect.top));
      setProgress(scrolled / scrollable);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  const barShift = staticMode ? -12 : 38 - progress * 58;
  const barBlur = staticMode ? 14 : 8 + progress * 22;
  const barOpacity = staticMode ? 0.85 : 0.35 + progress * 0.55;

  const line1Opacity = staticMode ? 0.35 : segmentOpacity(progress, 0.12, 0.28) * 0.38;
  const line2Opacity = staticMode ? 0.72 : segmentOpacity(progress, 0.28, 0.48) * 0.88;
  const line3Opacity = staticMode ? 1 : segmentOpacity(progress, 0.48, 0.68);

  const calmOpacity = staticMode ? 1 : segmentOpacity(progress, 0.72, 0.86);
  const pressureOpacity = staticMode ? 1 : segmentOpacity(progress, 0.86, 1);

  const legendFade = staticMode ? 0 : clamp01(1 - segmentOpacity(progress, 0.7, 0.82));

  if (staticMode) {
    return (
      <section className="cap-scroll-narrative cap-scroll-narrative--static" aria-label="Narrativa de inversión">
        <div className="cap-scroll-narrative__static-block">
          {LEGEND_LINES.map((line) => (
            <p key={line} className="cap-scroll-narrative__line">
              {line}
            </p>
          ))}
        </div>
        <div className="cap-scroll-narrative__static-block">
          <h2 className="cap-scroll-narrative__phase-title">Configúralo con calma.</h2>
          <ul className="cap-scroll-narrative__steps">
            {CALM_STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
        <div className="cap-scroll-narrative__static-block">
          <h2 className="cap-scroll-narrative__phase-title">Se activa bajo presión.</h2>
          <p className="cap-scroll-narrative__phase-text">
            La disciplina se nota cuando el mercado se mueve. Tu panel, tu asesor y tu estrategia siguen contigo.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      className="cap-scroll-narrative"
      aria-label="Narrativa de inversión"
    >
      <div className="cap-scroll-narrative__sticky">
        <div
          className="cap-scroll-narrative__legend"
          style={{ opacity: legendFade }}
        >
          {LEGEND_LINES.map((line, i) => {
            const opacity = i === 0 ? line1Opacity : i === 1 ? line2Opacity : line3Opacity;
            return (
              <p
                key={line}
                className={`cap-scroll-narrative__line${i === 2 ? ' cap-scroll-narrative__line--bright' : ''}`}
                style={{ opacity }}
              >
                {line}
              </p>
            );
          })}
        </div>

        <div
          className="cap-scroll-narrative__phase cap-scroll-narrative__phase--calm"
          style={{ opacity: calmOpacity, transform: `translateY(${(1 - calmOpacity) * 40}px)` }}
        >
          <h2 className="cap-scroll-narrative__phase-title">Configúralo con calma.</h2>
          <ul className="cap-scroll-narrative__steps">
            {CALM_STEPS.map((step, i) => (
              <li
                key={step}
                style={{ opacity: segmentOpacity(calmOpacity, i * 0.2, i * 0.2 + 0.35) }}
              >
                {step}
              </li>
            ))}
          </ul>
        </div>

        <div
          className="cap-scroll-narrative__phase cap-scroll-narrative__phase--pressure"
          style={{ opacity: pressureOpacity, transform: `translateY(${(1 - pressureOpacity) * 32}px)` }}
        >
          <h2 className="cap-scroll-narrative__phase-title">Se activa bajo presión.</h2>
          <p className="cap-scroll-narrative__phase-text">
            La disciplina se nota cuando el mercado se mueve. Tu panel, tu asesor y tu estrategia siguen contigo.
          </p>
        </div>

        <div
          className="cap-scroll-narrative__bars"
          style={{
            transform: `translateX(${barShift}%)`,
            filter: `blur(${barBlur}px)`,
            opacity: barOpacity,
          }}
          aria-hidden
        >
          {bars.map((bar, i) => (
            <span
              key={i}
              className={`cap-scroll-narrative__bar${bar.warm ? ' cap-scroll-narrative__bar--warm' : ''}`}
              style={{
                height: `${bar.height * 100}%`,
                filter: `blur(${bar.blur}px)`,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
