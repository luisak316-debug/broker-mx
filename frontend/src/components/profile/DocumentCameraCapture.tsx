import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DocumentDetectionTracker,
  INE_ASPECT,
  PASSPORT_ASPECT,
  analyzeDocumentFrame,
  computeGuideRect,
  overlayToVideoCrop,
  type FrameRect,
} from '../../lib/documentFrameDetection';

export type DocumentCaptureKind = 'ine' | 'passport';
export type DocumentCaptureSide = 'ANVERSO' | 'REVERSO';

type Props = {
  open: boolean;
  kind: DocumentCaptureKind;
  side?: DocumentCaptureSide;
  onCapture: (base64: string, mimeType: string) => void;
  onClose: () => void;
};

function documentLabel(kind: DocumentCaptureKind, side?: DocumentCaptureSide): string {
  if (kind === 'passport') return 'pasaporte';
  return side === 'REVERSO' ? 'reverso de tu INE' : 'frente de tu INE';
}

function speakHint(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-MX';
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

export function DocumentCameraCapture({ open, kind, side, onCapture, onClose }: Props) {
  const maskId = useId();
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trackerRef = useRef(new DocumentDetectionTracker());
  const rafRef = useRef<number>(0);

  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [guide, setGuide] = useState<FrameRect | null>(null);
  const [detected, setDetected] = useState(false);
  const [hint, setHint] = useState('Enfoca tu documento dentro del marco');

  const aspect = kind === 'passport' ? PASSPORT_ASPECT : INE_ASPECT;
  const isReverse = kind === 'ine' && side === 'REVERSO';
  const frameStroke = detected ? '#34d399' : isReverse ? '#38bdf8' : '#fbbf24';

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    trackerRef.current.reset();
  }, []);

  const close = useCallback(() => {
    stopCamera();
    setError('');
    setReady(false);
    setDetected(false);
    setGuide(null);
    onClose();
  }, [onClose, stopCamera]);

  useEffect(() => {
    if (!open) {
      stopCamera();
      return;
    }

    let cancelled = false;
    trackerRef.current.reset();
    setError('');
    setReady(false);
    setDetected(false);
    setHint(
      isReverse
        ? 'Voltea tu INE y alinea el reverso en el marco'
        : kind === 'ine'
          ? 'Fotografía del frente — alinea tu INE en el marco'
          : 'Enfoca tu documento dentro del marco',
    );

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setReady(true);
        }
      } catch {
        setError(
          'No pudimos acceder a la cámara. Permite el acceso en tu dispositivo e intenta de nuevo.',
        );
      }
    }

    void startCamera();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, stopCamera, kind, side, isReverse]);

  useEffect(() => {
    if (!open || !ready || kind !== 'ine') return;
    if (side === 'REVERSO') {
      speakHint('Ahora fotografía el reverso de tu I N E. Voltea tu credencial.');
    } else if (side === 'ANVERSO') {
      speakHint('Fotografía del frente. Alinea tu I N E en el marco.');
    }
  }, [open, ready, kind, side]);

  useEffect(() => {
    if (!open || !ready) return;

    const analysisCanvas = document.createElement('canvas');
    const analysisCtx = analysisCanvas.getContext('2d', { willReadFrequently: true });
    if (!analysisCtx) return;

    function tick() {
      const video = videoRef.current;
      const container = containerRef.current;
      const ctx = analysisCtx;
      if (!video?.videoWidth || !container || !ctx) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      const cw = container.clientWidth;
      const ch = container.clientHeight;
      const frame = computeGuideRect(cw, ch, aspect);
      setGuide(frame);

      analysisCanvas.width = cw;
      analysisCanvas.height = ch;
      ctx.drawImage(video, 0, 0, cw, ch);
      const result = analyzeDocumentFrame(ctx, frame, cw, ch);
      const stable = trackerRef.current.update(result.detected);
      setDetected(stable);
      setHint(
        stable
          ? isReverse
            ? 'Reverso detectado — puedes capturar'
            : kind === 'ine'
              ? 'Frente detectado — puedes capturar'
              : 'Documento detectado — puedes capturar'
          : isReverse
            ? 'Voltea tu INE y centra el reverso en el marco'
            : result.meanLum < 35
              ? 'Hay poca luz. Acércate a una fuente de luz.'
              : result.variance < 350
                ? kind === 'ine' && side === 'ANVERSO'
                  ? 'Centra el frente de tu INE en el marco'
                  : 'Centra tu documento en el marco'
                : 'Mantén la cámara firme sobre el documento',
      );

      rafRef.current = requestAnimationFrame(tick);
    }

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [open, ready, aspect, isReverse, kind, side]);

  function capture() {
    const video = videoRef.current;
    const container = containerRef.current;
    if (!video?.videoWidth || !container || !guide || !detected) return;

    setBusy(true);
    setError('');
    try {
      const crop = overlayToVideoCrop(video, container, guide);
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(crop.w);
      canvas.height = Math.round(crop.h);
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo capturar la imagen.');

      ctx.drawImage(
        video,
        crop.x,
        crop.y,
        crop.w,
        crop.h,
        0,
        0,
        canvas.width,
        canvas.height,
      );

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const base64 = dataUrl.split(',')[1];
      if (!base64) throw new Error('No se pudo procesar la foto.');

      onCapture(base64, 'image/jpeg');
      stopCamera();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo capturar la foto.');
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex flex-col bg-black">
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-sm font-semibold text-white">
            {isReverse ? 'Fotografía del reverso' : kind === 'ine' ? 'Fotografía del frente' : 'Captura tu documento'}
          </p>
          <p className="text-xs text-slate-400">
            {kind === 'ine' ? `Captura el ${documentLabel(kind, side)}` : documentLabel(kind, side)} · {hint}
          </p>
        </div>
        <button type="button" className="btn-ghost text-sm" disabled={busy} onClick={close}>
          Cancelar
        </button>
      </div>

      <div ref={containerRef} className="relative min-h-0 flex-1 overflow-hidden bg-black">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          playsInline
          muted
        />
        {guide && (
          <div className="pointer-events-none absolute inset-0">
            {isReverse && (
              <div
                className="doc-capture-frame-reverse absolute rounded-xl border-[3px] border-sky-400/80 bg-sky-500/5"
                style={{
                  left: guide.x,
                  top: guide.y,
                  width: guide.w,
                  height: guide.h,
                }}
              />
            )}
            <svg className="h-full w-full" viewBox={`0 0 ${containerRef.current?.clientWidth ?? 1} ${containerRef.current?.clientHeight ?? 1}`}>
              <defs>
                <mask id={maskId}>
                  <rect width="100%" height="100%" fill="white" />
                  <rect
                    x={guide.x}
                    y={guide.y}
                    width={guide.w}
                    height={guide.h}
                    rx="12"
                    fill="black"
                  />
                </mask>
              </defs>
              <rect width="100%" height="100%" fill="rgba(0,0,0,0.55)" mask={`url(#${maskId})`} />
              <rect
                x={guide.x}
                y={guide.y}
                width={guide.w}
                height={guide.h}
                rx="12"
                fill="none"
                stroke={frameStroke}
                strokeWidth="3"
              />
              <line
                x1={guide.x + 12}
                y1={guide.y + 12}
                x2={guide.x + 36}
                y2={guide.y + 12}
                stroke={frameStroke}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1={guide.x + 12}
                y1={guide.y + 12}
                x2={guide.x + 12}
                y2={guide.y + 36}
                stroke={frameStroke}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1={guide.x + guide.w - 12}
                y1={guide.y + 12}
                x2={guide.x + guide.w - 36}
                y2={guide.y + 12}
                stroke={frameStroke}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1={guide.x + guide.w - 12}
                y1={guide.y + 12}
                x2={guide.x + guide.w - 12}
                y2={guide.y + 36}
                stroke={frameStroke}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1={guide.x + 12}
                y1={guide.y + guide.h - 12}
                x2={guide.x + 36}
                y2={guide.y + guide.h - 12}
                stroke={frameStroke}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1={guide.x + 12}
                y1={guide.y + guide.h - 12}
                x2={guide.x + 12}
                y2={guide.y + guide.h - 36}
                stroke={frameStroke}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1={guide.x + guide.w - 12}
                y1={guide.y + guide.h - 12}
                x2={guide.x + guide.w - 36}
                y2={guide.y + guide.h - 12}
                stroke={frameStroke}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <line
                x1={guide.x + guide.w - 12}
                y1={guide.y + guide.h - 12}
                x2={guide.x + guide.w - 12}
                y2={guide.y + guide.h - 36}
                stroke={frameStroke}
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          </div>
        )}
      </div>

      <div className="space-y-2 px-4 py-4">
        {error && <p className="text-sm text-bear">{error}</p>}
        <button
          type="button"
          className="btn-primary w-full"
          disabled={busy || !!error || !detected}
          onClick={capture}
        >
          {busy ? 'Procesando…' : detected ? (isReverse ? 'Tomar foto del reverso' : kind === 'ine' ? 'Tomar foto del frente' : 'Tomar foto') : isReverse ? 'Voltea tu INE y alinea el reverso' : 'Alinea el documento en el marco'}
        </button>
        <p className="text-center text-xs text-slate-500">
          Solo se acepta la foto capturada aquí. Debe verse completa dentro del rectángulo.
        </p>
      </div>
    </div>,
    document.body,
  );
}
