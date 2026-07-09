import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CapitalGlobeVideo } from './CapitalGlobeVideo';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  hero: ReactNode;
  afterHero?: ReactNode;
};

/** Stage fijo (esfera) + track scroll (solo tarjeta vidrio sube bajo el header) */
export function LandingCapitalScrolly({ hero, afterHero }: Props) {
  const scrollRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    const id = requestAnimationFrame(refresh);
    const t = window.setTimeout(refresh, 500);
    window.addEventListener('load', refresh);
    return () => {
      cancelAnimationFrame(id);
      window.clearTimeout(t);
      window.removeEventListener('load', refresh);
    };
  }, []);

  return (
    <div ref={scrollRootRef} className="cap-scrolly" data-cap-scrolly data-cap-version="7">
      <div className="cap-scrolly__stage">
        <div className="cap-scrolly__stage-inner">
          <CapitalGlobeVideo />
        </div>
      </div>

      <div className="cap-scrolly__track">
        <section className="cap-scrolly__panel cap-scrolly__panel--hero">
          <div className="cap-scrolly__panel-inner">{hero}</div>
        </section>

        {afterHero ? (
          <section className="cap-scrolly__panel cap-scrolly__panel--tail">{afterHero}</section>
        ) : null}
      </div>
    </div>
  );
}
