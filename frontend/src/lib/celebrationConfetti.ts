type ConfettiOptions = {
  /** 0–1, posición horizontal del origen extra */
  originX?: number;
  /** 0–1, posición vertical del origen extra */
  originY?: number;
  /** Más partículas para registro exitoso */
  intensity?: 'normal' | 'celebration' | 'subtle';
  /** Paleta personalizada (p. ej. oro/platino premium) */
  palette?: string[];
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  w: number;
  h: number;
  color: string;
  rotation: number;
  spin: number;
  opacity: number;
  decay: number;
  shape: 'rect' | 'circle';
};

const COLORS = [
  '#38bdf8',
  '#818cf8',
  '#6366f1',
  '#f472b6',
  '#fb7185',
  '#fbbf24',
  '#fcd34d',
  '#34d399',
  '#60a5fa',
  '#c084fc',
  '#ffffff',
];

let activeCanvas: HTMLCanvasElement | null = null;
let rafId = 0;

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function particleCount(intensity: ConfettiOptions['intensity']): number {
  const w = window.innerWidth;
  const base =
    intensity === 'celebration' ? 160 : intensity === 'subtle' ? 72 : 110;
  if (w < 480) return Math.round(base * 0.65);
  if (w < 768) return Math.round(base * 0.82);
  return base;
}

function pickColor(palette?: string[]): string {
  const colors = palette?.length ? palette : COLORS;
  return colors[Math.floor(Math.random() * colors.length)]!;
}

function spawnParticles(
  width: number,
  count: number,
  originX?: number,
  originY?: number,
  palette?: string[],
): Particle[] {
  const particles: Particle[] = [];

  for (let i = 0; i < count; i += 1) {
    const fromTop = i < count * 0.55;
    const x = fromTop
      ? Math.random() * width
      : originX != null
        ? originX * width + (Math.random() - 0.5) * 120
        : Math.random() * width;
    const y = fromTop
      ? -20 - Math.random() * (window.innerHeight * 0.35)
      : originY != null
        ? originY * window.innerHeight + (Math.random() - 0.5) * 40
        : -30 - Math.random() * 80;

    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * (fromTop ? 5.5 : 9),
      vy: Math.random() * 2.5 + (fromTop ? 1.5 : 3),
      w: Math.random() * 7 + 4,
      h: Math.random() * 5 + 3,
      color: pickColor(palette),
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.28,
      opacity: 1,
      decay: Math.random() * 0.006 + 0.004,
      shape: Math.random() > 0.35 ? 'rect' : 'circle',
    });
  }

  return particles;
}

function drawParticle(ctx: CanvasRenderingContext2D, p: Particle) {
  ctx.save();
  ctx.globalAlpha = Math.max(0, p.opacity);
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rotation);
  ctx.fillStyle = p.color;
  if (p.shape === 'circle') {
    ctx.beginPath();
    ctx.arc(0, 0, p.w * 0.45, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
  }
  ctx.restore();
}

/** Confeti tipo celebridad: cae desde arriba, se desvanece al bajar. */
export function fireCelebrationConfetti(options: ConfettiOptions = {}): void {
  if (prefersReducedMotion()) return;

  if (activeCanvas) {
    cancelAnimationFrame(rafId);
    activeCanvas.remove();
    activeCanvas = null;
  }

  const canvas = document.createElement('canvas');
  canvas.setAttribute('aria-hidden', 'true');
  canvas.className = 'celebration-confetti-canvas';
  document.body.appendChild(canvas);
  activeCanvas = canvas;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    canvas.remove();
    activeCanvas = null;
    return;
  }

  const context = ctx;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    context.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resize();

  const particles = spawnParticles(
    window.innerWidth,
    particleCount(options.intensity),
    options.originX,
    options.originY,
    options.palette,
  );

  const started = performance.now();
  const maxMs =
    options.intensity === 'celebration'
      ? 4200
      : options.intensity === 'subtle'
        ? 2800
        : 3400;

  function frame(now: number) {
    if (!activeCanvas) return;
    context.clearRect(0, 0, window.innerWidth, window.innerHeight);

    let alive = 0;
    for (const p of particles) {
      p.vy += 0.11;
      p.vx *= 0.995;
      p.x += p.vx;
      p.y += p.vy;
      p.rotation += p.spin;
      p.opacity -= p.decay;
      if (p.opacity <= 0 || p.y > window.innerHeight + 40) continue;
      alive += 1;
      drawParticle(context, p);
    }

    if (alive > 0 && now - started < maxMs) {
      rafId = requestAnimationFrame(frame);
    } else {
      canvas.remove();
      if (activeCanvas === canvas) activeCanvas = null;
    }
  }

  rafId = requestAnimationFrame(frame);
}

export function confettiFromElement(
  el: HTMLElement,
  intensity: ConfettiOptions['intensity'] = 'normal',
  palette?: string[],
) {
  const rect = el.getBoundingClientRect();
  fireCelebrationConfetti({
    originX: (rect.left + rect.width / 2) / window.innerWidth,
    originY: (rect.top + rect.height / 2) / window.innerHeight,
    intensity,
    palette,
  });
}
