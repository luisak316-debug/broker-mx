import { useEffect, useRef, useState } from 'react';
import { useCall } from './CallContext';
import { CallKeypad } from './CallKeypad';
import { clientFirstName } from '../lib/format';

function fmtTimer(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const phaseLabel: Record<string, string> = {
  connecting: 'Conectando…',
  ringing: 'Marcando…',
  active: 'En llamada',
  ended: 'Llamada finalizada',
  error: 'Error',
};

export function CallWidget() {
  const {
    state,
    hangup,
    toggleMute,
    toggleSpeaker,
    toggleKeypad,
    sendDtmf,
    attachRemoteAudio,
  } = useCall();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const dragRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  const [pos, setPos] = useState({ x: 24, y: 96 });

  useEffect(() => {
    attachRemoteAudio(audioRef.current);
  }, [attachRemoteAudio]);

  if (state.phase === 'idle') return null;

  const name = state.call ? clientFirstName(state.call.clientName) : 'Contacto';
  const showControls = state.phase === 'active' || state.phase === 'ringing' || state.phase === 'connecting';

  function onDragStart(clientX: number, clientY: number) {
    dragRef.current = { x: clientX, y: clientY, left: pos.x, top: pos.y };
  }

  function onDragMove(clientX: number, clientY: number) {
    if (!dragRef.current) return;
    setPos({
      x: Math.max(8, dragRef.current.left + (clientX - dragRef.current.x)),
      y: Math.max(8, dragRef.current.top + (clientY - dragRef.current.y)),
    });
  }

  function onDragEnd() {
    dragRef.current = null;
  }

  return (
    <>
      <audio ref={audioRef} autoPlay playsInline className="sr-only" />
      <div
        className="call-widget"
        style={{ left: pos.x, top: pos.y }}
        role="dialog"
        aria-label="Llamada en curso"
      >
        <header
          className="call-widget-header"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            onDragStart(e.clientX, e.clientY);
          }}
          onPointerMove={(e) => {
            if (dragRef.current) onDragMove(e.clientX, e.clientY);
          }}
          onPointerUp={onDragEnd}
          onPointerCancel={onDragEnd}
        >
          <span className="call-widget-status-dot" data-phase={state.phase} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">{name}</p>
            <p className="text-xs text-slate-400">
              {phaseLabel[state.phase] ?? state.phase}
              {state.phase === 'active' ? ` · ${fmtTimer(state.elapsedSec)}` : ''}
            </p>
          </div>
        </header>

        {state.call && (
          <p className="call-widget-meta px-4 text-xs text-slate-500">
            Cliente {state.call.receiverMasked} · Línea {state.call.emitterMasked}
          </p>
        )}

        {state.error && (
          <p className="mx-4 mb-2 rounded-lg bg-danger/15 px-2 py-1.5 text-xs text-danger">
            {state.error}
          </p>
        )}

        {state.keypadOpen && showControls && (
          <div className="px-4 pb-2">
            <CallKeypad onKey={sendDtmf} />
          </div>
        )}

        {showControls && (
          <div className="call-widget-controls">
            <button
              type="button"
              className={`call-widget-btn ${state.speakerOn ? 'call-widget-btn-active' : ''}`}
              onClick={toggleSpeaker}
              title="Altavoz"
            >
              <span aria-hidden>🔊</span>
              <span className="text-[10px]">Altavoz</span>
            </button>
            <button
              type="button"
              className={`call-widget-btn ${state.muted ? 'call-widget-btn-active' : ''}`}
              onClick={toggleMute}
              title="Silencio"
            >
              <span aria-hidden>{state.muted ? '🔇' : '🎙️'}</span>
              <span className="text-[10px]">Silencio</span>
            </button>
            <button
              type="button"
              className={`call-widget-btn ${state.keypadOpen ? 'call-widget-btn-active' : ''}`}
              onClick={toggleKeypad}
              title="Teclado"
            >
              <span aria-hidden>⌨️</span>
              <span className="text-[10px]">Teclado</span>
            </button>
            <button type="button" className="call-widget-btn call-widget-btn-hangup" onClick={() => void hangup()} title="Finalizar">
              <span aria-hidden>📵</span>
              <span className="text-[10px]">Finalizar</span>
            </button>
          </div>
        )}

        {state.phase === 'ended' && (
          <p className="px-4 pb-4 text-center text-xs text-slate-400">Llamada terminada</p>
        )}
      </div>
    </>
  );
}
