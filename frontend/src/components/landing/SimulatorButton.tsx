import { useEffect, useRef } from 'react';

type Props = {
  onClick: () => void;
};

export function SimulatorButton({ onClick }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('btn-simulator-sunset--in-view');
          observer.disconnect();
        }
      },
      { threshold: 0.45, rootMargin: '0px 0px -5% 0px' }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      className="btn-simulator-sunset w-full"
    >
      <span className="btn-simulator-sunset__label">Ver simulador</span>
    </button>
  );
}
