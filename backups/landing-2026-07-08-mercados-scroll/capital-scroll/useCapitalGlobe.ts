import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  buildGlobePoints,
  buildHorizonRings,
  globeFragmentShader,
  globeVertexShader,
} from './buildGlobeGeometry';

gsap.registerPlugin(ScrollTrigger);

type Options = {
  scrollRootRef: RefObject<HTMLElement | null>;
  enabled?: boolean;
};

export function useCapitalGlobe(canvasRef: RefObject<HTMLCanvasElement | null>, options: Options) {
  const rotationRef = useRef({ x: -0.38, y: 2.05 });
  const idleRef = useRef(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const scrollRoot = options.scrollRootRef.current;
    if (!canvas || !scrollRoot || options.enabled === false) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
    camera.position.set(0, 0.05, 3.15);
    camera.lookAt(0, -0.55, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const globeGroup = new THREE.Group();
    globeGroup.position.y = -1.72;
    globeGroup.scale.setScalar(2.45);
    scene.add(globeGroup);

    const geometry = buildGlobePoints(1.5);
    const material = new THREE.ShaderMaterial({
      vertexShader: globeVertexShader,
      fragmentShader: globeFragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const globe = new THREE.Points(geometry, material);
    globeGroup.add(globe);

    const horizon = buildHorizonRings(1.52);
    horizon.group.position.y = 0.04;
    globeGroup.add(horizon.group);

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      if (w <= 0 || h <= 0) return;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };

    const render = () => {
      const scrollY = rotationRef.current.y;
      const scrollX = rotationRef.current.x;
      globeGroup.rotation.x = scrollX;
      globeGroup.rotation.y = scrollY + idleRef.current;
      renderer.render(scene, camera);
      if (!reduced) idleRef.current += 0.00032;
      rafRef.current = requestAnimationFrame(render);
    };

    resize();
    render();

    const scrollTween = reduced
      ? null
      : gsap.to(rotationRef.current, {
          x: 0.08,
          y: rotationRef.current.y + Math.PI * 2,
          ease: 'none',
          scrollTrigger: {
            trigger: scrollRoot,
            start: 'top top',
            end: 'bottom bottom',
            scrub: true,
            invalidateOnRefresh: true,
          },
        });

    const resizeObserver = new ResizeObserver(resize);
    if (canvas.parentElement) resizeObserver.observe(canvas.parentElement);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      resizeObserver.disconnect();
      scrollTween?.scrollTrigger?.kill();
      scrollTween?.kill();

      geometry.dispose();
      material.dispose();
      horizon.core.dispose();
      horizon.glow.dispose();
      horizon.coreMat.dispose();
      horizon.glowMat.dispose();
      renderer.dispose();
      scene.clear();
    };
  }, [canvasRef, options.scrollRootRef, options.enabled]);
}
