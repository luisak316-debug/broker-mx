import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../../api/client';
import { useClientAuth } from '../../auth/ClientAuthContext';
import { getUploadsBase } from '../../lib/apiConfig';

type Props = {
  photoUrl?: string;
  initials: string;
  onPhotoSaved: (url: string) => void;
  size?: 'md' | 'lg';
};

const SIZE = {
  md: { box: 'h-11 w-11 sm:h-12 sm:w-12', text: 'text-sm', cam: 'h-4 w-4 text-[10px]' },
  lg: {
    box: 'h-12 w-12 sm:h-14 sm:w-14 lg:h-16 lg:w-16',
    text: 'text-base lg:text-lg',
    cam: 'h-4 w-4 sm:h-5 sm:w-5 text-[10px] sm:text-xs',
  },
} as const;

function resolvePhotoUrl(url?: string): string | undefined {
  if (!url) return undefined;
  if (url.startsWith('http')) return url;
  return `${getUploadsBase()}${url}`;
}

export function ProfileAvatar({ photoUrl, initials, onPhotoSaved, size = 'md' }: Props) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [failed, setFailed] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const { client, refreshSession } = useClientAuth();
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }, []);

  const closeModal = useCallback(() => {
    stopCamera();
    setOpen(false);
    setError('');
    setBusy(false);
  }, [stopCamera]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    async function startCamera() {
      setError('');
      setCameraReady(false);
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
        setCameraReady(true);
      } catch {
        if (!cancelled) {
          setError('No pudimos acceder a la cámara. Permite el acceso o cierra e intenta de nuevo.');
        }
      }
    }

    void startCamera();
    return () => {
      cancelled = true;
      stopCamera();
    };
  }, [open, stopCamera]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeModal();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, closeModal]);

  async function capturePhoto() {
    const video = videoRef.current;
    if (!video || !video.videoWidth || !client?.id) return;

    setBusy(true);
    setError('');
    setFailed(false);
    try {
      const side = Math.min(video.videoWidth, video.videoHeight);
      const canvas = document.createElement('canvas');
      canvas.width = side;
      canvas.height = side;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('No se pudo capturar la imagen.');

      const sx = (video.videoWidth - side) / 2;
      const sy = (video.videoHeight - side) / 2;
      ctx.drawImage(video, sx, sy, side, side, 0, 0, side, side);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      const base64 = dataUrl.split(',')[1];
      if (!base64) throw new Error('No se pudo procesar la foto.');

      const res = await api.uploadProfilePhoto(client.id, { data: base64 });
      onPhotoSaved(res.profilePhotoUrl);
      await refreshSession();
      closeModal();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la foto.');
    } finally {
      setBusy(false);
    }
  }

  const resolved = resolvePhotoUrl(photoUrl);
  const s = SIZE[size];

  useEffect(() => {
    setFailed(false);
  }, [photoUrl]);

  const modal =
    open &&
    createPortal(
      <div
        className="fixed inset-0 z-[200] flex items-end justify-center bg-black/75 p-3 sm:items-center sm:p-4"
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-photo-title"
        onClick={closeModal}
      >
        <div
          className="w-full max-w-md rounded-2xl border border-amber-400/40 bg-ink-900 p-4 shadow-2xl sm:p-5"
          onClick={(e) => e.stopPropagation()}
        >
          <h3 id="profile-photo-title" className="text-lg font-semibold text-white">
            Foto de perfil
          </h3>
          <p className="mt-1 text-sm text-slate-400">
            Usa tu cámara frontal en tiempo real. No se permiten fotos de galería.
          </p>

          <div className="relative mt-4 flex aspect-square w-full items-center justify-center overflow-hidden rounded-xl bg-ink-800">
            <video
              ref={videoRef}
              className={`aspect-square w-full object-cover mirror ${cameraReady ? 'block' : 'hidden'}`}
              playsInline
              muted
            />
            {!cameraReady && (
              <p className="px-4 text-center text-sm text-slate-400">
                {error || 'Activando cámara…'}
              </p>
            )}
          </div>

          {error && cameraReady && <p className="mt-3 text-sm text-bear">{error}</p>}

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <button type="button" className="btn-ghost" disabled={busy} onClick={closeModal}>
              Cancelar
            </button>
            <button
              type="button"
              className="btn-primary"
              disabled={busy || !cameraReady}
              onClick={() => void capturePhoto()}
            >
              {busy ? 'Guardando…' : 'Capturar foto'}
            </button>
          </div>
        </div>
      </div>,
      document.body,
    );

  return (
    <>
      <button
        type="button"
        className={`group relative shrink-0 ${s.box}`}
        aria-label="Tomar foto de perfil"
        onClick={() => setOpen(true)}
      >
        {resolved && !failed ? (
          <img
            key={resolved}
            src={resolved}
            alt="Foto de perfil"
            className={`${s.box} rounded-full object-cover ring-2 ring-amber-400/50`}
            onError={() => setFailed(true)}
          />
        ) : (
          <span
            className={`${s.box} grid place-items-center rounded-full bg-gradient-to-br from-amber-400/90 to-brand-600 font-semibold text-white ring-2 ring-amber-400/40 ${s.text}`}
          >
            {initials}
          </span>
        )}
        <span
          className={`absolute -bottom-0.5 -right-0.5 grid place-items-center rounded-full bg-amber-400 text-ink-900 shadow-md ring-2 ring-ink-900 ${s.cam}`}
        >
          📷
        </span>
      </button>
      {modal}
    </>
  );
}
