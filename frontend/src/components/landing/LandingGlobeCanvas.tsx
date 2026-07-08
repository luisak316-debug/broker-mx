import { useEffect, useRef } from 'react';

type Point3D = {
  x: number;
  y: number;
  z: number;
  lit: boolean;
};

function buildSpherePoints(count: number, radius: number): Point3D[] {
  const phi = Math.PI * (3 - Math.sqrt(5));
  const points: Point3D[] = [];

  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const r = Math.sqrt(Math.max(0, 1 - y * y));
    const theta = phi * i;
    const x = Math.cos(theta) * r;
    const z = Math.sin(theta) * r;

    const lat = Math.asin(y);
    const lon = Math.atan2(z, x);
    const lit =
      Math.sin(lon * 2.4 + 0.8) * Math.cos(lat * 3.1) +
        Math.sin(lon * 5.2 - 1.2) * 0.45 >
      0.12;

    points.push({ x: x * radius, y: y * radius, z: z * radius, lit });
  }

  return points;
}

function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function LandingGlobeCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const points = buildSpherePoints(2400, 1);
    const reduced = prefersReducedMotion();
    let angleY = 0.4;
    let angleX = 0.22;
    let raf = 0;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.floor(rect.width * dpr);
      canvas.height = Math.floor(rect.height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      if (w <= 0 || h <= 0) {
        raf = requestAnimationFrame(draw);
        return;
      }

      ctx.clearRect(0, 0, w, h);

      const mobile = w < 768;
      const cx = w * (mobile ? 0.68 : 0.58);
      const cy = h * (mobile ? 0.68 : 0.56);
      const scale = Math.min(w, h) * (mobile ? 0.52 : 0.46);
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const projected: { sx: number; sy: number; z: number; lit: boolean }[] = [];

      for (const p of points) {
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        const perspective = 2.8 / (2.8 + z2);
        projected.push({
          sx: cx + x1 * scale * perspective,
          sy: cy + y2 * scale * perspective,
          z: z2,
          lit: p.lit,
        });
      }

      projected.sort((a, b) => a.z - b.z);

      for (const dot of projected) {
        const depth = (dot.z + 1) / 2;
        const size = (dot.lit ? 2.4 : 1.6) * (0.55 + depth * 0.65);

        if (dot.lit) {
          const glow = ctx.createRadialGradient(dot.sx, dot.sy, 0, dot.sx, dot.sy, size * 3);
          glow.addColorStop(0, `rgba(255, 183, 90, ${0.25 + depth * 0.35})`);
          glow.addColorStop(1, 'rgba(255, 183, 90, 0)');
          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(dot.sx, dot.sy, size * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(dot.sx, dot.sy, size, 0, Math.PI * 2);
        if (dot.lit) {
          ctx.fillStyle = `rgba(255, ${160 + depth * 60}, ${70 + depth * 30}, ${0.55 + depth * 0.4})`;
        } else {
          ctx.fillStyle = `rgba(90, 95, 120, ${0.15 + depth * 0.35})`;
        }
        ctx.fill();
      }

      const rimX = cx - scale * 0.72;
      const rimY = cy - scale * 0.55;
      const rim = ctx.createRadialGradient(rimX, rimY, 0, rimX, rimY, scale * 1.1);
      rim.addColorStop(0, 'rgba(255, 190, 100, 0.55)');
      rim.addColorStop(0.35, 'rgba(255, 150, 60, 0.18)');
      rim.addColorStop(1, 'rgba(255, 150, 60, 0)');
      ctx.fillStyle = rim;
      ctx.beginPath();
      ctx.arc(cx, cy, scale * 1.05, 0, Math.PI * 2);
      ctx.fill();

      if (!reduced) {
        angleY += 0.0028;
        angleX += 0.0004;
      }

      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="cap-globe-canvas"
      aria-hidden
    />
  );
}
