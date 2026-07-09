const COLORS = ['#fffef7', '#fde68a', '#fef3c7', '#ffffff', '#fcd34d'];

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Destellos finos que caen suavemente al pulsar CTAs clave */
export function triggerCelebrationBurst(originX: number, originY: number): void {
  if (prefersReducedMotion()) return;

  const layer = document.createElement('div');
  layer.className = 'celebration-burst';
  layer.setAttribute('aria-hidden', 'true');
  document.body.appendChild(layer);

  const count = 22;
  for (let i = 0; i < count; i++) {
    const piece = document.createElement('span');
    piece.className = 'celebration-burst__piece';
    const isDiamond = i % 5 === 0;
    if (isDiamond) piece.classList.add('celebration-burst__piece--diamond');

    const spreadX = (Math.random() - 0.5) * 140;
    const startY = originY - 20 - Math.random() * 60;
    const startX = originX + spreadX;
    const driftX = (Math.random() - 0.5) * 36;
    const fallY = 70 + Math.random() * 110;
    const size = isDiamond ? 2 + Math.random() * 2 : 1.5 + Math.random() * 2.5;
    const delay = Math.random() * 0.2;
    const duration = 1.4 + Math.random() * 0.6;

    piece.style.left = `${startX}px`;
    piece.style.top = `${startY}px`;
    piece.style.width = `${size}px`;
    piece.style.height = isDiamond ? `${size}px` : `${size * 0.45}px`;
    piece.style.background = COLORS[Math.floor(Math.random() * COLORS.length)]!;
    piece.style.setProperty('--cb-drift-x', `${driftX}px`);
    piece.style.setProperty('--cb-fall-y', `${fallY}px`);
    piece.style.setProperty('--cb-spin', `${Math.random() * 180 - 90}deg`);
    piece.style.animationDelay = `${delay}s`;
    piece.style.animationDuration = `${duration}s`;

    layer.appendChild(piece);
  }

  window.setTimeout(() => layer.remove(), 2200);
}

export function celebrationFromElement(el: HTMLElement): void {
  const rect = el.getBoundingClientRect();
  triggerCelebrationBurst(rect.left + rect.width / 2, rect.top + rect.height * 0.35);
}
