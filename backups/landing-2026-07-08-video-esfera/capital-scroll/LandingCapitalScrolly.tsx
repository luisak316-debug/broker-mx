import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CapitalGlobeVideo } from './CapitalGlobeVideo';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  hero: ReactNode;
  afterHero?: ReactNode;
};

export function LandingCapitalScrolly({ hero, afterHero }: Props) {
  const scrollRootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div ref={scrollRootRef} className="cap-scrolly" data-cap-scrolly data-cap-version="5">
      <div className="cap-scrolly__stage" aria-hidden>
        <CapitalGlobeVideo scrollRootRef={scrollRootRef} />
        <div className="cap-scrolly__vignette" />
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
