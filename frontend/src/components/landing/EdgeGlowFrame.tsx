import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
};

/** Marco con borde multicolor animado (estilo iluminación perimetral iPhone). */
export function EdgeGlowFrame({ children, className = '' }: Props) {
  return (
    <div className={`edge-glow-frame ${className}`.trim()}>
      <div className="edge-glow-frame__aura" aria-hidden />
      <div className="edge-glow-frame__ring" aria-hidden />
      <div className="edge-glow-frame__inner">{children}</div>
    </div>
  );
}
