import { confettiFromElement } from './celebrationConfetti';

const PREMIUM_PALETTE = [
  '#C9A962',
  '#E8D5A3',
  '#F5F0E6',
  '#B8B2A6',
  '#8B7D6B',
  '#D4C4A8',
  '#FFFFFF',
];

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Celebración sobria al fondear: destello dorado y partículas champagne/platino. */
export function fireFundCelebration(el: HTMLElement): void {
  if (!prefersReducedMotion()) {
    confettiFromElement(el, 'subtle', PREMIUM_PALETTE);
  }

  el.classList.add('fund-nav-link--clicked');

  const ripple = document.createElement('span');
  ripple.className = 'fund-nav-link__ripple';
  ripple.setAttribute('aria-hidden', 'true');
  el.appendChild(ripple);
  ripple.addEventListener('animationend', () => ripple.remove(), { once: true });

  window.setTimeout(() => el.classList.remove('fund-nav-link--clicked'), 950);
}
