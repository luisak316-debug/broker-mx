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
import { AdvisorSipPhone, sessionStateToPhase } from './sipPhone';
import type { CallUiState, WebRtcSipConfig } from './types';

const initialState: CallUiState = {
  phase: 'idle',
  call: null,
  error: null,
  muted: false,
  speakerOn: true,
  keypadOpen: false,
  elapsedSec: 0,
};

type CallContextValue = {
  state: CallUiState;
  phoneReady: boolean;
  phoneError: string | null;
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
  const [state, setState] = useState<CallUiState>(initialState);
  const [phoneReady, setPhoneReady] = useState(false);
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const phone = phoneRef.current;
    phone.setCallbacks({
      onSessionState: (sessionState: SessionState) => {
        const phase = sessionStateToPhase(sessionState);
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
      onError: (message) => {
        setState((s) => ({ ...s, phase: 'error', error: message }));
      },
    });

    let cancelled = false;
    (async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Tu navegador no soporta micrófono web.');
        }
        await navigator.mediaDevices.getUserMedia({ audio: true, video: false });

        const config: WebRtcSipConfig = await api.telephonyWebRtcConfig();
        if (cancelled) return;
        await phone.connect(config);
        if (cancelled) return;
        setPhoneReady(true);
        setPhoneError(null);
      } catch (e) {
        if (cancelled) return;
        setPhoneReady(false);
        const msg = e instanceof Error ? e.message : 'Teléfono web no disponible.';
        if (msg.includes('Permission') || msg.includes('NotAllowed')) {
          setPhoneError('Permite el micrófono en el navegador para usar llamadas.');
        } else {
          setPhoneError(msg);
        }
      }
    })();

    return () => {
      cancelled = true;
      void phone.disconnect();
      if (timerRef.current) window.clearInterval(timerRef.current);
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

  const startCall = useCallback(
    async (contactId: string, clientName: string) => {
      if (!phoneReady) {
        setState((s) => ({
          ...s,
          phase: 'error',
          error: phoneError ?? 'Teléfono web no listo.',
        }));
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

      try {
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
        setState((s) => ({ ...s, phase: 'ringing' }));
      } catch (e) {
        setState((s) => ({
          ...s,
          phase: 'error',
          error: e instanceof Error ? e.message : 'No se pudo iniciar la llamada.',
        }));
      }
    },
    [phoneReady, phoneError],
  );

  const hangup = useCallback(async () => {
    await phoneRef.current.hangup();
    setState((s) => ({ ...s, phase: 'ended' }));
    window.setTimeout(() => setState({ ...initialState }), 800);
  }, []);

  const toggleMute = useCallback(() => {
    setState((s) => {
      const muted = !s.muted;
      phoneRef.current.setMuted(muted);
      return { ...s, muted };
    });
  }, []);

  const toggleSpeaker = useCallback(() => {
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
    void phoneRef.current.sendDtmf(tone);
  }, []);

  const attachRemoteAudio = useCallback((el: HTMLAudioElement | null) => {
    if (el) phoneRef.current.attachRemoteAudio(el);
  }, []);

  const value = useMemo(
    () => ({
      state,
      phoneReady,
      phoneError,
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
