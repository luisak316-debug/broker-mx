import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { SessionState } from 'sip.js';
import { api } from '../api/client';
import { dialViaMicrosip, hangupMicrosip } from '../lib/microsipCall';
import { isMicrosipCallMode } from './callMode';
import { AdvisorSipPhone, sessionStateToPhase } from './sipPhone';
import { startRingback, stopRingback } from './ringback';
import type { CallUiState, TelephonyConfig } from './types';

const initialState: CallUiState = {
  phase: 'idle',
  call: null,
  error: null,
  statusDetail: null,
  muted: false,
  speakerOn: true,
  keypadOpen: false,
  elapsedSec: 0,
};

type CallBackend = 'microsip' | 'webrtc';

type CallContextValue = {
  state: CallUiState;
  phoneReady: boolean;
  phoneError: string | null;
  callBackend: CallBackend | null;
  startCall: (contactId: string, clientName: string) => Promise<void>;
  hangup: () => Promise<void>;
  toggleMute: () => void;
  toggleSpeaker: () => void;
  toggleKeypad: () => void;
  sendDtmf: (tone: string) => void;
  attachRemoteAudio: (el: HTMLAudioElement | null) => void;
};

const CallContext = createContext<CallContextValue | null>(null);

export function CallProvider({ children }: { children: ReactNode }) {
  const phoneRef = useRef(new AdvisorSipPhone());
  const callBackendRef = useRef<CallBackend>('microsip');
  const [state, setState] = useState<CallUiState>(initialState);
  const [phoneReady, setPhoneReady] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [callBackend, setCallBackend] = useState<CallBackend | null>(null);
  const timerRef = useRef<number | null>(null);
  const connectGenRef = useRef(0);
  const microsipTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const phone = phoneRef.current;
    const connectGen = ++connectGenRef.current;
    phone.setCallbacks({
      onSessionState: (sessionState: SessionState) => {
        const phase = sessionStateToPhase(sessionState);
        if (phase === 'active' || phase === 'ended') stopRingback();
        setState((s) => ({
          ...s,
          phase: phase === 'ended' ? 'ended' : phase,
          error: null,
        }));
        if (phase === 'ended') {
          window.setTimeout(() => {
            setState((s) => (s.phase === 'ended' ? { ...initialState } : s));
          }, 1200);
        }
      },
      onRinging: () => {
        startRingback();
        setState((s) =>
          s.phase === 'connecting' || s.phase === 'ringing' ? { ...s, phase: 'ringing' } : s,
        );
      },
      onStatus: (detail) => {
        setState((s) => ({ ...s, statusDetail: detail }));
      },
      onError: (message) => {
        stopRingback();
        setState((s) => ({ ...s, phase: 'error', error: message }));
      },
    });

    let cancelled = false;
    (async () => {
      try {
        const config: TelephonyConfig = await api.telephonyConfig();
        if (cancelled || connectGen !== connectGenRef.current) return;

        const backend: CallBackend = isMicrosipCallMode(config) ? 'microsip' : 'webrtc';
        callBackendRef.current = backend;
        setCallBackend(backend);

        if (backend === 'microsip') {
          if (!/Windows/i.test(navigator.userAgent)) {
            throw new Error('Las llamadas requieren Windows con MicroSIP en la laptop.');
          }
          setPhoneReady(true);
          setPhoneError(null);
          return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Tu navegador no soporta micrófono web.');
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        if (cancelled || connectGen !== connectGenRef.current) return;
        await phone.connect(config, stream);
        if (cancelled || connectGen !== connectGenRef.current) return;
        setPhoneReady(true);
        setPhoneError(null);
      } catch (e) {
        if (cancelled || connectGen !== connectGenRef.current) return;
        setPhoneReady(false);
        const msg = e instanceof Error ? e.message : 'Teléfono no disponible.';
        if (msg.includes('Permission') || msg.includes('NotAllowed')) {
          setPhoneError('Permite el micrófono en el navegador para usar llamadas.');
        } else if (msg.includes('REGISTER request already in progress')) {
          setPhoneError('Registrando línea… recarga en unos segundos (Ctrl+F5).');
        } else {
          setPhoneError(msg);
        }
      }
    })();

    return () => {
      cancelled = true;
      void phone.disconnect();
      if (timerRef.current) window.clearInterval(timerRef.current);
      if (microsipTimerRef.current) window.clearTimeout(microsipTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (state.phase === 'active') {
      timerRef.current = window.setInterval(() => {
        setState((s) => ({ ...s, elapsedSec: s.elapsedSec + 1 }));
      }, 1000);
      return () => {
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = null;
      };
    }
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
    return undefined;
  }, [state.phase]);

  const dialingRef = useRef(false);

  const startMicrosipCall = useCallback(async (contactId: string, clientName: string) => {
    setState({
      ...initialState,
      phase: 'connecting',
      call: {
        contactId,
        clientName,
        receiverMasked: '…',
        emitterMasked: '…',
      },
      speakerOn: true,
      statusDetail: 'Preparando marcación…',
    });

    const dial = await api.contactCallDial(contactId);
    setState((s) => ({
      ...s,
      phase: 'ringing',
      call: s.call
        ? {
            ...s.call,
            receiverMasked: dial.receiverMasked,
            emitterMasked: dial.emitterMasked,
          }
        : null,
      statusDetail: 'Marcando…',
    }));

    await dialViaMicrosip(dial.dialString);

    if (microsipTimerRef.current) window.clearTimeout(microsipTimerRef.current);
    microsipTimerRef.current = window.setTimeout(() => {
      setState((s) =>
        s.phase === 'ringing' || s.phase === 'connecting'
          ? {
              ...s,
              phase: 'active',
              statusDetail: 'Llamada saliente. Audio por auricular USB (MicroSIP en bandeja).',
            }
          : s,
      );
    }, 4000);
  }, []);

  const startCall = useCallback(
    async (contactId: string, clientName: string) => {
      if (dialingRef.current || state.phase === 'connecting' || state.phase === 'ringing' || state.phase === 'active') {
        return;
      }
      if (!phoneReady) {
        setState((s) => ({
          ...s,
          phase: 'error',
          error: phoneError ?? 'Teléfono no listo.',
        }));
        return;
      }

      try {
        if (callBackendRef.current === 'microsip') {
          dialingRef.current = true;
          await startMicrosipCall(contactId, clientName);
          return;
        }

        setState({
          ...initialState,
          phase: 'connecting',
          call: {
            contactId,
            clientName,
            receiverMasked: '…',
            emitterMasked: '…',
          },
          speakerOn: true,
        });

        const dial = await api.contactCallDial(contactId);
        setState((s) => ({
          ...s,
          call: s.call
            ? {
                ...s.call,
                receiverMasked: dial.receiverMasked,
                emitterMasked: dial.emitterMasked,
              }
            : null,
        }));
        await phoneRef.current.call(dial.dialString);
      } catch (e) {
        stopRingback();
        dialingRef.current = false;
        setState((s) => ({
          ...s,
          phase: 'error',
          error: e instanceof Error ? e.message : 'No se pudo iniciar la llamada.',
        }));
      }
    },
    [phoneReady, phoneError, startMicrosipCall, state.phase],
  );

  const hangup = useCallback(async () => {
    stopRingback();
    dialingRef.current = false;
    if (microsipTimerRef.current) {
      window.clearTimeout(microsipTimerRef.current);
      microsipTimerRef.current = null;
    }
    if (callBackendRef.current === 'microsip') {
      hangupMicrosip();
    } else if (callBackendRef.current === 'webrtc') {
      await phoneRef.current.hangup();
    }
    setState((s) => ({ ...s, phase: 'ended' }));
    window.setTimeout(() => setState({ ...initialState }), 800);
  }, []);

  const toggleMute = useCallback(() => {
    if (callBackendRef.current !== 'webrtc') return;
    setState((s) => {
      const muted = !s.muted;
      phoneRef.current.setMuted(muted);
      return { ...s, muted };
    });
  }, []);

  const toggleSpeaker = useCallback(() => {
    if (callBackendRef.current !== 'webrtc') return;
    setState((s) => {
      const speakerOn = !s.speakerOn;
      phoneRef.current.setSpeakerOn(speakerOn);
      return { ...s, speakerOn };
    });
  }, []);

  const toggleKeypad = useCallback(() => {
    setState((s) => ({ ...s, keypadOpen: !s.keypadOpen }));
  }, []);

  const sendDtmf = useCallback((tone: string) => {
    if (callBackendRef.current === 'webrtc') {
      void phoneRef.current.sendDtmf(tone);
    }
  }, []);

  const attachRemoteAudio = useCallback((el: HTMLAudioElement | null) => {
    if (el) phoneRef.current.attachRemoteAudio(el);
  }, []);

  const value = useMemo(
    () => ({
      state,
      phoneReady,
      phoneError,
      callBackend,
      startCall,
      hangup,
      toggleMute,
      toggleSpeaker,
      toggleKeypad,
      sendDtmf,
      attachRemoteAudio,
    }),
    [
      state,
      phoneReady,
      phoneError,
      callBackend,
      startCall,
      hangup,
      toggleMute,
      toggleSpeaker,
      toggleKeypad,
      sendDtmf,
      attachRemoteAudio,
    ],
  );

  return <CallContext.Provider value={value}>{children}</CallContext.Provider>;
}

export function useCall(): CallContextValue {
  const ctx = useContext(CallContext);
  if (!ctx) throw new Error('useCall debe usarse dentro de CallProvider');
  return ctx;
}
