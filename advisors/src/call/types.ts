export type CallPhase = 'idle' | 'connecting' | 'ringing' | 'active' | 'ended' | 'error';

export type WebRtcSipConfig = {
  wssUrl: string;
  bridgeMode?: 'provider' | 'embedded' | 'custom';
  domain: string;
  username: string;
  authorizationPassword: string;
  displayName: string;
  stunServers: string[];
};

/** microsip = línea UDP vía MicroSIP oculto; webrtc = SIP.js (solo señalización útil hoy). */
export type TelephonyConfig = WebRtcSipConfig & {
  callMode?: 'microsip' | 'webrtc';
};

export type ActiveCallInfo = {
  contactId: string;
  clientName: string;
  receiverMasked: string;
  emitterMasked: string;
};

export type CallUiState = {
  phase: CallPhase;
  call: ActiveCallInfo | null;
  error: string | null;
  statusDetail: string | null;
  muted: boolean;
  speakerOn: boolean;
  keypadOpen: boolean;
  elapsedSec: number;
};
