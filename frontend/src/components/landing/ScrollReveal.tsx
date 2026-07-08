import { type ReactNode, useEffect, useRef, useState } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Revelado al scroll — escritorio y móvil (estilo Capital.com). */
export function ScrollReveal({ children, className = '' }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [motion, setMotion] = useState(true);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setMotion(false);
      setVisible(true);
      return;
    }

    setMotion(true);
    const node = ref.current;
    if (!node) return;

    const reveal = () => setVisible(true);

    if (node.getBoundingClientRect().top < window.innerHeight * 0.92) {
      reveal();
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          reveal();
          observer.disconnect();
        }
      },
      { threshold: 0.08, rootMargin: '0px 0px 8% 0px' },
    );

    observer.observe(node);
    const fallback = window.setTimeout(() => {
      reveal();
      observer.disconnect();
    }, 1800);

    return () => {
      window.clearTimeout(fallback);
      observer.disconnect();
    };
  }, []);

  if (!motion) {
    return className ? <div className={className}>{children}</div> : <>{children}</>;
  }

  return (
    <div
      ref={ref}
      className={`cap-scroll-reveal ${visible ? 'cap-scroll-reveal--visible' : ''} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
