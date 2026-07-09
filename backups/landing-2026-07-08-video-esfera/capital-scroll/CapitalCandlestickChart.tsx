import { useEffect, useId, useMemo, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { buildCandleSeries, type Candle } from './capitalCandleData';

gsap.registerPlugin(ScrollTrigger);

type Props = {
  candles?: Candle[];
  className?: string;
  triggerRef: RefObject<HTMLElement | null>;
  side?: 'left' | 'right';
};

const VIEW_W = 320;
const VIEW_H = 180;
const PAD = 12;

function scaleY(value: number, min: number, max: number) {
  const range = max - min || 1;
  return PAD + ((max - value) / range) * (VIEW_H - PAD * 2);
}

export function CapitalCandlestickChart({
  candles: candlesProp,
  className = '',
  triggerRef,
  side = 'right',
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const clipId = useId().replace(/:/g, '');

  const candles = useMemo(() => candlesProp ?? buildCandleSeries(18, side === 'left' ? 11 : 29), [candlesProp, side]);

  const { min, max, slot } = useMemo(() => {
    let min = Infinity;
    let max = -Infinity;
    for (const c of candles) {
      min = Math.min(min, c.low);
      max = Math.max(max, c.high);
    }
    const innerW = VIEW_W - PAD * 2;
    const slot = innerW / candles.length;
    return { min, max, slot };
  }, [candles]);

  useEffect(() => {
    const svg = svgRef.current;
    const group = groupRef.current;
    const trigger = triggerRef.current;
    if (!svg || !group || !trigger) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const bodies = group.querySelectorAll<SVGRectElement>('[data-candle-body]');
    const wicks = group.querySelectorAll<SVGLineElement>('[data-candle-wick]');

    if (reduced) {
      gsap.set([...bodies, ...wicks], { opacity: 1, scaleY: 1, x: 0 });
      return;
    }

    gsap.set(bodies, { transformOrigin: 'center bottom', scaleY: 0, opacity: 0.4 });
    gsap.set(wicks, { opacity: 0, scaleX: 0.4, transformOrigin: 'center center' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger,
        start: 'top 80%',
        end: 'top 35%',
        scrub: true,
      },
    });

    tl.to(
      bodies,
      {
        scaleY: 1,
        opacity: 1,
        stagger: 0.04,
        ease: 'none',
      },
      0,
    ).to(
      wicks,
      {
        opacity: 1,
        scaleX: 1,
        stagger: 0.04,
        ease: 'none',
      },
      0,
    );

    const drift = gsap.to(group, {
      x: side === 'left' ? 28 : -28,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start: 'top 70%',
        end: 'bottom 30%',
        scrub: true,
      },
    });

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
      drift.scrollTrigger?.kill();
      drift.kill();
    };
  }, [candles, side, triggerRef]);

  return (
    <svg
      ref={svgRef}
      className={`cap-candles ${className}`.trim()}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-label="Gráfica de velas japonesas"
    >
      <defs>
        <clipPath id={clipId}>
          <rect x={PAD} y={PAD} width={VIEW_W - PAD * 2} height={VIEW_H - PAD * 2} rx="6" />
        </clipPath>
        <linearGradient id={`${clipId}-bg`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>
      </defs>
      <rect
        x="1"
        y="1"
        width={VIEW_W - 2}
        height={VIEW_H - 2}
        rx="12"
        fill="rgba(10,10,10,0.72)"
        stroke="rgba(255,255,255,0.08)"
      />
      <rect x={PAD} y={PAD} width={VIEW_W - PAD * 2} height={VIEW_H - PAD * 2} fill={`url(#${clipId}-bg)`} />
      <g ref={groupRef} clipPath={`url(#${clipId})`}>
        {candles.map((c, i) => {
          const x = PAD + i * slot + slot * 0.28;
          const bodyW = Math.max(4, slot * 0.44);
          const bullish = c.close >= c.open;
          const top = scaleY(Math.max(c.open, c.close), min, max);
          const bottom = scaleY(Math.min(c.open, c.close), min, max);
          const bodyH = Math.max(2, bottom - top);
          const wickX = x + bodyW / 2;
          const color = bullish ? '#16a34a' : '#dc2626';

          return (
            <g key={i}>
              <line
                data-candle-wick
                x1={wickX}
                x2={wickX}
                y1={scaleY(c.high, min, max)}
                y2={scaleY(c.low, min, max)}
                stroke={color}
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <rect
                data-candle-body
                x={x}
                y={top}
                width={bodyW}
                height={bodyH}
                rx="1.2"
                fill={color}
              />
            </g>
          );
        })}
      </g>
    </svg>
  );
}
