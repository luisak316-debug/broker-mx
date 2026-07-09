import { useCallback, useRef } from 'react';
import { useScrollFrame } from '../../../hooks/useScrollFrame';

type Props = {
  scrollRootRef: React.RefObject<HTMLElement | null>;
};

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** Leyenda fija en el stage — aparece cuando la tarjeta sube (scroll nativo) */
export function CapHeroScrollReveal({ scrollRootRef }: Props) {
  const revealRef = useRef<HTMLDivElement>(null);
  const rootRef = scrollRootRef;

  const update = useCallback(() => {
    const reveal = revealRef.current;
    const root = rootRef.current;
    if (!reveal || !root) return;

    const heroPanel = root.querySelector('.cap-scrolly__panel--hero') as HTMLElement | null;
    if (!heroPanel) return;

    const scrollable = heroPanel.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;

    const heroProgress = clamp01(-heroPanel.getBoundingClientRect().top / scrollable);
    const fadeIn = clamp01((heroProgress - 0.04) / 0.1);

    // Permanece en el globo hasta que «Nuestra firma» (#quienes) sube al viewport
    let fadeOut = 1;
    const quienes = root.querySelector('#quienes') as HTMLElement | null;
    if (quienes) {
      const top = quienes.getBoundingClientRect().top;
      const vh = window.innerHeight;
      const hideStart = vh * 0.88;
      const hideEnd = vh * 0.4;
      fadeOut = clamp01((top - hideEnd) / (hideStart - hideEnd));
    }

    const intensity = fadeIn * fadeOut;
    const show = intensity > 0.02;

    reveal.classList.toggle('cap-hero-reveal--visible', show);
    reveal.style.opacity = String(intensity);

    if (show) {
      reveal.style.transform = `translateY(${28 - fadeIn * 28}px)`;
    } else {
      reveal.style.transform = heroProgress < 0.04 ? 'translateY(28px)' : 'translateY(-10px)';
    }
  }, [rootRef]);

  useScrollFrame(update);

  return (
    <div ref={revealRef} className="cap-hero-reveal">
      <div className="cap-hero-reveal__mirror mx-auto w-full max-w-7xl px-4">
        <div className="cap-hero-reveal__shell">
          <div className="cap-hero-reveal__inner max-w-2xl">
            <h2 className="cap-hero-reveal__title">Soporte local. Conexión global.</h2>
            <p className="cap-hero-reveal__subtitle">
              Autorizada y regulada por la Comisión Nacional Bancaria y de Valores (CNBV).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
