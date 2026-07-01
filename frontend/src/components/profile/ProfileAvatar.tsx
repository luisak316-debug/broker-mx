import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../../api/client';
import { getUploadsBase } from '../../lib/apiConfig';

type Props = {
  photoUrl?: string;
  initials: string;
  onPhotoSaved: (url: string) => void;
};

function resolvePhotoUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${getUploadsBase()}${url}`;
}

export function ProfileAvatar({ photoUrl, initials, onPhotoSaved }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  useEffect(() => {
    if (!open) {
      stopCamera();
      setError('');
      return;
    }

    let cancelled = false;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
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
        }
      } catch {
        setError('No pudimos acceder a la cámara frontal. Permite el acceso e intenta de nuevo.');
      }
    }

    void startCamera();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, stopCamera]);

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    setBusy(true);
    setError('');
    try {
      const size = Math.min(video.videoWidth, video.videoHeight);
      const canvas = document.createElement('canvas');
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo capturar la imagen.');

      const sx = (video.videoWidth - size) / 2;
      const sy = (video.videoHeight - size) / 2;
      ctx.drawImage(video, sx, sy, size, size, 0, 0, size, size);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      const base64 = dataUrl.split(',')[1];
      if (!base64) throw new Error('No se pudo procesar la foto.');

      const res = await api.uploadProfilePhoto({
        data: base64,
        capturedAt: new Date().toISOString(),
      });
      onPhotoSaved(res.profilePhotoUrl);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la foto.');
    } finally {
      setBusy(false);
    }
  }

  const resolved = resolvePhotoUrl(photoUrl);

  return (
    <>
      <button
        type="button"
        className="group relative h-9 w-9 shrink-0"
        aria-label="Tomar foto de perfil"
        onClick={() => setOpen(true)}
      >
        {resolved ? (
          <img
            src={resolved}
            alt="Foto de perfil"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-amber-400/40"
          />
        ) : (
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink-600 text-sm font-semibold text-white ring-2 ring-amber-400/30">
            {initials}
          </span>
        )}
        <span className="absolute -bottom-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-amber-400 text-[10px] text-ink-900 shadow-md ring-2 ring-ink-900">
          📷
        </span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-amber-400/40 bg-ink-900 p-5 shadow-2xl">
            <h3 className="text-lg font-semibold text-white">Foto de perfil</h3>
            <p className="mt-1 text-sm text-slate-400">
              Usa tu cámara frontal en tiempo real. No se permiten fotos de galería.
            </p>

            <div className="relative mt-4 overflow-hidden rounded-xl bg-black">
              <video
                ref={videoRef}
                className="aspect-square w-full object-cover mirror"
                playsInline
                muted
              />
            </div>

            {error && <p className="mt-3 text-sm text-bear">{error}</p>}

            <div className="mt-4 flex flex-wrap justify-end gap-2">
              <button
                type="button"
                className="btn-ghost"
                disabled={busy}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn-primary"
                disabled={busy || !!error}
                onClick={() => void capturePhoto()}
              >
                {busy ? 'Guardando…' : 'Capturar foto'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
