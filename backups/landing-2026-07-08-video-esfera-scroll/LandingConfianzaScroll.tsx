import type { ReactNode } from 'react';
import { LandingScrollNarrative } from './LandingScrollNarrative';

type Props = {
  children: ReactNode;
};

/** Barras borrosas tipo Capital detrás de la sección Confianza / testimonios. */
export function LandingConfianzaScroll({ children }: Props) {
  return (
    <LandingScrollNarrative mode="backdrop" id="testimonios">
      {children}
    </LandingScrollNarrative>
  );
}
