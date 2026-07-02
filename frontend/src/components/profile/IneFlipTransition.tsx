import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

function speakSpanish(text: string): void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'es-MX';
  utterance.rate = 0.92;
  window.speechSynthesis.speak(utterance);
}

type Props = {
  open: boolean;
  onComplete: () => void;
};

export function IneFlipTransition({ open, onComplete }: Props) {
  const completedRef = useRef(false);

  useEffect(() => {
    if (!open) {
      completedRef.current = false;
      return;
    }

    speakSpanish(
      'Fotografía del frente capturada correctamente. Ahora voltea tu I N E para capturar el reverso.',
    );

    const timer = window.setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      onComplete();
    }, 4200);

    return () => window.clearTimeout(timer);
  }, [open, onComplete]);

  if (!open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[210] flex flex-col items-center justify-center bg-black/92 px-6 text-center"
      role="dialog"
      aria-live="assertive"
      aria-label="Voltea tu INE para capturar el reverso"
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-400">
        <span className="text-2xl text-emerald-300" aria-hidden>
          ✓
        </span>
      </div>

      <p className="text-lg font-semibold text-emerald-300">
        Fotografía del frente capturada correctamente
      </p>
      <p className="mt-2 max-w-sm text-sm text-slate-300">
        Guardamos el frente de tu INE. Sigue con el reverso.
      </p>

      <div className="doc-flip-stage mt-10">
        <div className="doc-flip-card">
          <div className="doc-flip-face doc-flip-face-front">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Frente</span>
            <span className="mt-2 text-[10px] text-slate-400">✓ Listo</span>
          </div>
          <div className="doc-flip-face doc-flip-face-back">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-300">Reverso</span>
            <span className="mt-2 text-[10px] text-slate-300">Voltea tu INE</span>
          </div>
        </div>
      </div>

      <p className="doc-flip-now mt-8 text-xl font-bold text-white">Ahora el reverso</p>
      <p className="mt-2 text-sm text-brand-200">Voltea tu credencial y alinea el reverso en el marco</p>

      <button
        type="button"
        className="btn-primary mt-8 min-w-[12rem]"
        onClick={() => {
          if (completedRef.current) return;
          completedRef.current = true;
          window.speechSynthesis?.cancel();
          onComplete();
        }}
      >
        Continuar al reverso
      </button>
    </div>,
    document.body,
  );
}
