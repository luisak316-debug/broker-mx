import { useEffect, useRef, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CapitalGlobeVideo } from './CapitalGlobeVideo';
import { CapitalCandlestickChart } from './CapitalCandlestickChart';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  hero: ReactNode;
  afterHero?: ReactNode;
};

export function LandingCapitalScrolly({ hero, afterHero }: Props) {
  const scrollRootRef = useRef<HTMLDivElement>(null);
  const panelLeftRef = useRef<HTMLDivElement>(null);
  const panelRightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div ref={scrollRootRef} className="cap-scrolly" data-cap-scrolly>
      <div className="cap-scrolly__stage" aria-hidden>
        <CapitalGlobeVideo scrollRootRef={scrollRootRef} />
        <div className="cap-scrolly__vignette" />
        <div className="cap-scrolly__fade-bottom" />
      </div>

      <div className="cap-scrolly__track">
        <section className="cap-scrolly__panel cap-scrolly__panel--hero">
          <div className="cap-scrolly__panel-inner">{hero}</div>

          <div ref={panelRightRef} className="cap-scrolly__chart cap-scrolly__chart--right">
            <CapitalCandlestickChart triggerRef={panelRightRef} side="right" />
          </div>
        </section>

        <section className="cap-scrolly__panel cap-scrolly__panel--mid">
          <div ref={panelLeftRef} className="cap-scrolly__chart cap-scrolly__chart--left">
            <CapitalCandlestickChart triggerRef={panelLeftRef} side="left" />
          </div>
        </section>

        {afterHero ? (
          <section className="cap-scrolly__panel cap-scrolly__panel--tail">{afterHero}</section>
        ) : null}
      </div>
    </div>
  );
}
