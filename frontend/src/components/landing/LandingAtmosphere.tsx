import { useEffect, useRef, useState } from 'react';

function isTouchOrMobileViewport(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(max-width: 767px)').matches ||
    window.matchMedia('(pointer: coarse)').matches
  );
}

/**
 * Capa de atmósfera azul en el hero (escritorio: se desvanece al scroll).
 * En móvil/tablet táctil NO usa capa fija — evita retrasos al mostrar «Quiénes Somos».
 */
export function LandingAtmosphere() {
  const ref = useRef<HTMLDivElement>(null);
  const [enabled] = useState(() => !isTouchOrMobileViewport());

  useEffect(() => {
    if (!enabled) return;

    const el = ref.current;
    if (!el) return;

    let raf = 0;

    const update = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = Math.min(window.innerHeight * 0.9, 680);
        const fade = Math.min(1, window.scrollY / max);
        el.style.setProperty('--landing-blue-fade', String(fade));
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
  }, [enabled]);

  if (!enabled) return null;

  return <div ref={ref} className="landing-atmosphere" aria-hidden />;
}
