import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const LEGEND_LINES = [
  'La mayoría de los traders pierde dinero',
  'El mercado juega su papel',
  'Tus decisiones marcan la diferencia',
] as const;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function applyNarrativeFrame(
  progress: number,
  lines: HTMLElement[],
  barsEl: HTMLElement | null,
  isBackdrop: boolean,
) {
  const step = 1 / 3;
  const activeIndex = Math.min(2, Math.floor(progress / step));

  lines.forEach((line, i) => {
    const visible = i <= activeIndex;
    line.classList.toggle('cap-scroll-narrative__line--visible', visible);
    line.classList.toggle('cap-scroll-narrative__line--bright', visible && i === activeIndex);
    line.setAttribute('aria-hidden', visible ? 'false' : 'true');
  });

  if (!barsEl) return;

  const shift = isBackdrop ? 62 - progress * 118 : 52 - progress * 92;
  const blur = isBackdrop ? 6 + progress * 34 : 10 + progress * 26;
  const opacity = isBackdrop ? 0.55 + progress * 0.42 : 0.62 + progress * 0.35;
  const scale = isBackdrop ? 0.94 + progress * 0.14 : 0.96 + progress * 0.08;

  gsap.set(barsEl, {
    xPercent: shift,
    scaleY: scale,
    filter: `blur(${blur}px)`,
    opacity,
  });
}

type BarSpec = {
  height: number;
  warm: boolean;
  blur: number;
};

type Props = {
  mode?: 'full' | 'backdrop';
  id?: string;
  children?: ReactNode;
};

export function LandingScrollNarrative({ mode = 'full', id, children }: Props) {
  const sectionRef = useRef<HTMLElement>(null);
  const stickyRef = useRef<HTMLDivElement>(null);
  const barsRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<(HTMLParagraphElement | null)[]>([]);
  const [staticMode, setStaticMode] = useState(false);
  const isBackdrop = mode === 'backdrop';

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
    const sticky = stickyRef.current;
    if (!section || !sticky) return;

    const lines = lineRefs.current.filter(Boolean) as HTMLElement[];

    const scrollLength = isBackdrop ? '+=220%' : '+=300%';

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: scrollLength,
      pin: sticky,
      pinSpacing: true,
      anticipatePin: 1,
      invalidateOnRefresh: true,
      onUpdate: (self) => {
        applyNarrativeFrame(self.progress, lines, barsRef.current, isBackdrop);
      },
      onRefresh: (self) => {
        applyNarrativeFrame(self.progress, lines, barsRef.current, isBackdrop);
      },
    });

    applyNarrativeFrame(trigger.progress, lines, barsRef.current, isBackdrop);

    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    window.addEventListener('resize', refresh);
    const t1 = window.setTimeout(refresh, 400);
    const t2 = window.setTimeout(refresh, 1500);
    const t3 = window.setTimeout(refresh, 3000);

    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
      window.clearTimeout(t3);
      window.removeEventListener('load', refresh);
      window.removeEventListener('resize', refresh);
      trigger.kill();
    };
  }, [isBackdrop]);

  if (staticMode) {
    return (
      <section
        id={id}
        className={`cap-scroll-narrative cap-scroll-narrative--static${isBackdrop ? ' cap-scroll-narrative--backdrop' : ''}`}
        aria-label={isBackdrop ? 'Confianza' : 'Narrativa de inversión'}
      >
        {!isBackdrop ? (
          <div className="cap-scroll-narrative__static-block">
            {LEGEND_LINES.map((line) => (
              <p key={line} className="cap-scroll-narrative__line cap-scroll-narrative__line--visible cap-scroll-narrative__line--bright">
                {line}
              </p>
            ))}
          </div>
        ) : null}
        {isBackdrop && children ? (
          <div className="cap-scroll-narrative__backdrop-content">{children}</div>
        ) : null}
      </section>
    );
  }

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`cap-scroll-narrative${isBackdrop ? ' cap-scroll-narrative--backdrop' : ''}`}
      aria-label={isBackdrop ? 'Confianza' : 'Narrativa de inversión'}
    >
      <div ref={stickyRef} className="cap-scroll-narrative__sticky">
        {!isBackdrop ? (
          <div className="cap-scroll-narrative__legend">
            {LEGEND_LINES.map((line, i) => (
              <p
                key={line}
                ref={(el) => {
                  lineRefs.current[i] = el;
                }}
                className="cap-scroll-narrative__line"
                aria-hidden="true"
              >
                {line}
              </p>
            ))}
          </div>
        ) : null}

        <div ref={barsRef} className="cap-scroll-narrative__bars" aria-hidden>
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

        {isBackdrop && children ? (
          <div className="cap-scroll-narrative__backdrop-content">{children}</div>
        ) : null}
      </div>
    </section>
  );
}
