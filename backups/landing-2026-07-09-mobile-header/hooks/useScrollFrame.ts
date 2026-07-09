import { useEffect, useRef } from 'react';

/** Ejecuta callback en cada frame — fiable al 100% zoom, sin depender de GSAP */
export function useScrollFrame(onFrame: () => void) {
  const cbRef = useRef(onFrame);
  cbRef.current = onFrame;

  useEffect(() => {
    let raf = 0;
    const tick = () => {
      cbRef.current();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    window.addEventListener('resize', tick, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', tick);
    };
  }, []);
}
