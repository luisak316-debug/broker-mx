import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  scrollRootRef: React.RefObject<HTMLElement | null>;
};

/** Leyenda en el stage fijo — visible cuando la tarjeta sube; oculta antes de Quiénes Somos */
export function CapHeroScrollReveal({ scrollRootRef }: Props) {
  const revealRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const reveal = revealRef.current;
    const root = scrollRootRef.current;
    if (!reveal || !root) return;

    const heroPanel = root.querySelector('.cap-scrolly__panel--hero') as HTMLElement | null;
    const tailPanel = root.querySelector('.cap-scrolly__panel--tail') as HTMLElement | null;
    if (!heroPanel) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      gsap.set(reveal, { opacity: 1, visibility: 'visible', y: 0 });
      return;
    }

    gsap.set(reveal, { opacity: 1, visibility: 'hidden', y: 28 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: heroPanel,
        start: 'top top',
        end: 'bottom top',
        scrub: 1.35,
        invalidateOnRefresh: true,
      },
    });

    /* Opacidad fija en 1 — solo visibility/y para evitar blanco semitransparente al hacer scroll */
    tl.to(reveal, { visibility: 'visible', y: 0, duration: 0.14, ease: 'power2.out' })
      .to(reveal, { duration: 0.58 })
      .to(reveal, { visibility: 'hidden', y: -10, duration: 0.28, ease: 'power2.in' });

    let tailTrigger: ScrollTrigger | undefined;

    if (tailPanel) {
      tailTrigger = ScrollTrigger.create({
        trigger: tailPanel,
        start: 'top 92%',
        onEnter: () => gsap.set(reveal, { opacity: 1, visibility: 'hidden', y: -10 }),
        onEnterBack: () => ScrollTrigger.refresh(),
      });
    }

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    window.addEventListener('resize', refresh);
    const t1 = window.setTimeout(refresh, 350);
    const t2 = window.setTimeout(refresh, 1200);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.removeEventListener('load', refresh);
      window.removeEventListener('resize', refresh);
      tailTrigger?.kill();
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [scrollRootRef]);

  return (
    <div ref={revealRef} className="cap-hero-reveal">
      <div className="cap-hero-reveal__mirror mx-auto w-full max-w-7xl px-4 pt-5 md:pt-8 lg:pt-10">
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
