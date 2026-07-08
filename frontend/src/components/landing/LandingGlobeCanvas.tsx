import { useEffect, useRef } from 'react';

type Point3D = {
  x: number;
  y: number;
  z: number;
  lit: boolean;
  tier: 0 | 1 | 2;
};

function buildGridPoints(latSteps: number, lonSteps: number, radius: number): Point3D[] {
  const points: Point3D[] = [];

  for (let latI = 0; latI <= latSteps; latI++) {
    const y = 1 - (latI / latSteps) * 2;
    const lat = Math.asin(Math.max(-1, Math.min(1, y)));
    const ring = Math.cos(lat);

    for (let lonI = 0; lonI <= lonSteps; lonI++) {
      const lon = (lonI / lonSteps) * Math.PI * 2;
      const x = Math.cos(lon) * ring;
      const z = Math.sin(lon) * ring;

      const land =
        Math.sin(lon * 2.4 + 0.8) * Math.cos(lat * 3.1) +
          Math.sin(lon * 5.2 - 1.2) * 0.45 +
          Math.cos(lat * 1.8 + lon * 0.6) * 0.28;
      const lit = land > 0.08;
      const tier: 0 | 1 | 2 = land > 0.5 ? 2 : land > 0.2 ? 1 : 0;

      points.push({ x: x * radius, y: y * radius, z: z * radius, lit, tier });
    }
  }

  return points;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

export function LandingGlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const pin = canvas.closest('.landing-globe-pin') as HTMLElement | null;
    const points = buildGridPoints(64, 128, 1);
    const reduced = prefersReducedMotion();
    let angleY = 2.15;
    const angleX = -0.36;
    let raf = 0;

    const updateScroll = () => {
      if (!pin) {
        scrollRef.current = clamp01(window.scrollY / Math.max(window.innerHeight * 1.1, 600));
        return;
      }
      const rect = pin.getBoundingClientRect();
      const scrollable = pin.offsetHeight - window.innerHeight;
      if (scrollable <= 0) {
        scrollRef.current = 0;
        return;
      }
      const scrolled = Math.min(scrollable, Math.max(0, -rect.top));
      scrollRef.current = scrolled / scrollable;
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawRim = (cx: number, cy: number, scale: number, alpha: number) => {
      const rimY = cy - scale;

      const halo = ctx.createRadialGradient(cx - scale * 0.18, rimY, 0, cx, rimY, scale * 0.5);
      halo.addColorStop(0, `rgba(255, 240, 210, ${0.32 * alpha})`);
      halo.addColorStop(0.35, `rgba(251, 190, 91, ${0.16 * alpha})`);
      halo.addColorStop(1, 'rgba(5, 2, 2, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.ellipse(cx, rimY, scale * 1.04, scale * 0.16, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      ctx.shadowColor = 'rgba(255, 225, 170, 0.85)';
      ctx.shadowBlur = scale * 0.07;
      ctx.beginPath();
      ctx.ellipse(cx, cy, scale, scale, 0, Math.PI * 1.05, Math.PI * 1.95);
      const stroke = ctx.createLinearGradient(cx - scale, rimY, cx + scale * 0.15, rimY);
      stroke.addColorStop(0, `rgba(170, 210, 255, ${0.35 * alpha})`);
      stroke.addColorStop(0.3, `rgba(255, 245, 230, ${0.92 * alpha})`);
      stroke.addColorStop(0.55, `rgba(255, 252, 245, ${alpha})`);
      stroke.addColorStop(0.82, `rgba(255, 210, 140, ${0.8 * alpha})`);
      stroke.addColorStop(1, `rgba(251, 190, 91, ${0.2 * alpha})`);
      ctx.strokeStyle = stroke;
      ctx.lineWidth = Math.max(2, scale * 0.012);
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w <= 0 || h <= 0) {
        raf = requestAnimationFrame(draw);
        return;
      }

      const scrollProgress = scrollRef.current;
      const scrollFade = clamp01(scrollProgress * 1.2);
      const globeAlpha = 1 - scrollFade * 0.9;
      const globeScale = 1 - scrollFade * 0.12;
      const driftY = scrollProgress * 32;

      ctx.clearRect(0, 0, w, h);

      const mobile = w < 768;
      const cx = w * 0.5;
      const cy = h * (mobile ? 1.5 : 1.47) + driftY;
      const scale = Math.max(w * (mobile ? 0.86 : 0.8), h * (mobile ? 1.06 : 1.02)) * globeScale;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const projected: {
        sx: number;
        sy: number;
        z: number;
        py: number;
        px: number;
        lit: boolean;
        tier: 0 | 1 | 2;
      }[] = [];

      for (const p of points) {
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        const perspective = 2.85 / (2.85 + z2);

        projected.push({
          sx: cx + x1 * scale * perspective,
          sy: cy + y2 * scale * perspective,
          z: z2,
          py: y2,
          px: x1,
          lit: p.lit,
          tier: p.tier,
        });
      }

      projected.sort((a, b) => a.z - b.z);

      for (const dot of projected) {
        if (dot.sy > h + 10) continue;

        const depth = (dot.z + 1) / 2;
        const rimLift = clamp01(1.08 - Math.abs(dot.py + 0.08) * 2.4);
        const size = (dot.lit ? (dot.tier === 2 ? 2.1 : 1.75) : 1.05) * (0.45 + depth * 0.55);

        if (dot.lit && dot.tier >= 1 && rimLift > 0.25) {
          const glow = ctx.createRadialGradient(dot.sx, dot.sy, 0, dot.sx, dot.sy, size * 3.5);
          glow.addColorStop(0, `rgba(255, 210, 140, ${(0.22 + rimLift * 0.28) * globeAlpha})`);
          glow.addColorStop(1, 'rgba(251, 190, 91, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(dot.sx, dot.sy, size * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(dot.sx, dot.sy, size, 0, Math.PI * 2);

        if (dot.lit) {
          const warm = rimLift * 0.3;
          if (dot.tier === 2) {
            ctx.fillStyle = `rgba(255, 198, 110, ${(0.82 + warm) * globeAlpha})`;
          } else if (dot.tier === 1) {
            ctx.fillStyle = `rgba(251, 175, 80, ${(0.68 + warm * 0.5) * globeAlpha})`;
          } else {
            ctx.fillStyle = `rgba(210, 175, 130, ${0.42 * globeAlpha})`;
          }
        } else {
          const spec = clamp01(dot.px * 0.55 + 0.15) * depth;
          const r = 14 + spec * 18;
          const g = 12 + spec * 8;
          const b = 28 + spec * 32;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${(0.5 + depth * 0.35) * globeAlpha})`;
        }

        ctx.fill();
      }

      drawRim(cx, cy, scale, globeAlpha);

      const fade = ctx.createLinearGradient(0, h * 0.5, 0, h);
      fade.addColorStop(0, 'rgba(5, 2, 2, 0)');
      fade.addColorStop(1, `rgba(5, 2, 2, ${0.95 * globeAlpha})`);
      ctx.fillStyle = fade;
      ctx.fillRect(0, 0, w, h);

      if (!reduced) {
        angleY += 0.00085;
      }

      raf = requestAnimationFrame(draw);
    };

    updateScroll();
    resize();
    draw();
    window.addEventListener('resize', resize);
    window.addEventListener('scroll', updateScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', updateScroll);
    };
  }, []);

  return <canvas ref={canvasRef} className="cap-globe-canvas" aria-hidden />;
}
