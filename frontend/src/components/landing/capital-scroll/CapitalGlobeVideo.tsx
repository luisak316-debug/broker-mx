import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** Misma fuente que capital.com — regulation hero globe */
const CAPITAL_GLOBE_VIDEO =
  'https://static.capital.com/home/regulation/europe-bg.mp4';

type Props = {
  scrollRootRef: React.RefObject<HTMLElement | null>;
};

export function CapitalGlobeVideo({ scrollRootRef }: Props) {
  const parallaxRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const parallax = parallaxRef.current;
    const root = scrollRootRef.current;
    if (!video || !parallax || !root) return;

    const play = () => {
      void video.play().catch(() => {
        /* autoplay bloqueado hasta interacción */
      });
    };

    play();
    video.addEventListener('loadeddata', play);

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let tween: gsap.core.Tween | null = null;

    if (!reduced) {
      tween = gsap.to(parallax, {
        y: -56,
        ease: 'none',
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: true,
        },
      });
    }

    return () => {
      video.removeEventListener('loadeddata', play);
      tween?.scrollTrigger?.kill();
      tween?.kill();
      video.pause();
    };
  }, [scrollRootRef]);

  return (
    <div className="cap-scrolly__video-wrap">
      <div ref={parallaxRef} className="cap-scrolly__video-parallax">
        <video
          ref={videoRef}
          className="cap-scrolly__video"
          aria-hidden
          muted
          playsInline
          loop
          autoPlay
          tabIndex={-1}
          preload="auto"
        >
          <source src={CAPITAL_GLOBE_VIDEO} type="video/mp4" />
        </video>
      </div>
    </div>
  );
}
