import { useEffect, useRef } from 'react';
import { GLOBE_VIDEO_SRC } from './globeVideo';

/** Esfera detrás de la tarjeta vidrio — mitad superior bajo el esmerilado */
export function CapitalGlobeVideoMini() {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      void video.play().catch(() => {});
    };

    play();
    video.addEventListener('loadeddata', play);
    return () => video.removeEventListener('loadeddata', play);
  }, []);

  return (
    <div className="cap-hero-globe-slot" aria-hidden>
      <video
        ref={videoRef}
        className="cap-hero-globe-slot__video"
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
