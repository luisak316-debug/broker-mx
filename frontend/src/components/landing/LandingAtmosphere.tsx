import { useEffect, useRef } from 'react';

/**
 * Fondo Capital.com — Midnight #050202 + resplandor azul que se apaga al scroll.
 */
export function LandingAtmosphere() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    const root = el?.closest('.landing-page') as HTMLElement | null;
    if (!el || !root) return;

    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const pin = root.querySelector('.landing-globe-pin') as HTMLElement | null;
        let blueFade = 0;
        let globeFade = 0;

        if (pin) {
          const rect = pin.getBoundingClientRect();
          const scrollable = pin.offsetHeight - window.innerHeight;
          const progress =
            scrollable > 0
              ? Math.min(1, Math.max(0, -rect.top) / scrollable)
              : Math.min(1, window.scrollY / Math.max(window.innerHeight * 1.1, 600));

          blueFade = Math.min(1, progress * 1.35);
          globeFade = Math.min(1, Math.max(0, (progress - 0.08) / 0.72));
        } else {
          blueFade = Math.min(1, window.scrollY / Math.max(window.innerHeight * 1.1, 600));
          globeFade = blueFade * 0.85;
        }

        root.style.setProperty('--landing-blue-fade', String(blueFade));
        root.style.setProperty('--landing-globe-fade', String(globeFade));
      });
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div ref={ref} className="landing-atmosphere" aria-hidden>
      <div className="landing-atmosphere__blue" />
      <div className="landing-atmosphere__rim" />
    </div>
  );
}
