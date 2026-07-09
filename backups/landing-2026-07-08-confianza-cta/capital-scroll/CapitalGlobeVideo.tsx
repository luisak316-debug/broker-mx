import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { GLOBE_VIDEO_SRC } from './globeVideo';

gsap.registerPlugin(ScrollTrigger);

/** Esfera fija en el stage — no se mueve al hacer scroll */
export function CapitalGlobeVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      void video.play().catch(() => {});
    };

    const refreshScroll = () => {
      ScrollTrigger.refresh();
    };

    play();
    video.addEventListener('loadeddata', play);
    video.addEventListener('loadeddata', refreshScroll);
    video.addEventListener('loadedmetadata', refreshScroll);
    return () => {
      video.removeEventListener('loadeddata', play);
      video.removeEventListener('loadeddata', refreshScroll);
      video.removeEventListener('loadedmetadata', refreshScroll);
    };
  }, []);

  return (
    <div className="cap-scrolly__globe-anchor" aria-hidden>
      <video
        ref={videoRef}
        className="cap-scrolly__globe-video"
        aria-hidden
        muted
        playsInline
        loop
        autoPlay
        tabIndex={-1}
        preload="auto"
      >
        <source src={GLOBE_VIDEO_SRC} type="video/mp4" />
      </video>
    </div>
  );
}
