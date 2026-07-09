import { useCallback, useRef } from 'react';
import { useScrollFrame } from '../../hooks/useScrollFrame';

const LINES = [
  'La mayoría de los traders pierde dinero',
  'El mercado juega su papel',
  'Tus decisiones marcan la diferencia',
] as const;

const BAR_HEIGHTS = [42, 68, 35, 82, 55, 91, 48, 73, 38, 86, 52, 77, 44, 95, 58, 70, 33, 88, 61, 49, 80, 40, 74, 63, 36, 90, 47, 84];

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function applyFrame(
  progress: number,
  lines: HTMLElement[],
  barsEl: HTMLElement | null,
) {
  const step = 1 / 3;
  const activeIndex = Math.min(2, Math.floor(progress / step));

  lines.forEach((line, i) => {
    const show = i <= activeIndex;
    line.classList.toggle('trader-scroll__line--show', show);
    line.classList.toggle('trader-scroll__line--active', show && i === activeIndex);
    line.setAttribute('aria-hidden', show ? 'false' : 'true');
  });

  if (barsEl) {
    const shift = 48 - progress * 96;
    barsEl.style.transform = `translateX(${shift}%) scaleY(${0.96 + progress * 0.08})`;
    barsEl.style.filter = `blur(${8 + progress * 22}px)`;
    barsEl.style.opacity = String(0.65 + progress * 0.3);
  }
}

/** Scrolly 3 frases + barras — scroll nativo + sticky CSS */
export function LandingTraderScroll({ id = 'narrativa-trading' }: { id?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const linesRef = useRef<HTMLElement[]>([]);
  const barsRef = useRef<HTMLElement | null>(null);

  const update = useCallback(() => {
    const root = rootRef.current;
    if (!root) return;

    const lines = linesRef.current;
    if (lines.length === 0) return;

    const vh = window.innerHeight;
    const scrollable = root.offsetHeight - vh;
    if (scrollable <= 0) return;

    const progress = clamp01(-root.getBoundingClientRect().top / scrollable);
    applyFrame(progress, lines, barsRef.current);
  }, []);

  useScrollFrame(update);

  return (
    <div ref={rootRef} id={id} className="trader-scroll" aria-label="Narrativa de inversión">
      <div className="trader-scroll__pin">
        <div className="trader-scroll__legend">
          {LINES.map((text, i) => (
            <p
              key={text}
              ref={(el) => {
                if (el) linesRef.current[i] = el;
              }}
              className="trader-scroll__line"
              aria-hidden="true"
            >
              {text}
            </p>
          ))}
        </div>

        <div
          ref={(el) => {
            barsRef.current = el;
          }}
          className="trader-scroll__bars"
          aria-hidden
        >
          {BAR_HEIGHTS.map((h, idx) => (
            <span
              key={idx}
              className={`trader-scroll__bar${idx % 3 !== 1 ? ' trader-scroll__bar--warm' : ''}`}
              style={{ height: `${35 + (h / 100) * 65}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
