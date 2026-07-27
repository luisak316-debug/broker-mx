import {
  Inviter,
  Registerer,
  RegistererState,
  Session,
  SessionState,
  UserAgent,
  Web,
  type UserAgentOptions,
} from 'sip.js';
import { tokenStore } from '../api/client';
import type { WebRtcSipConfig } from './types';

export type SipPhoneCallbacks = {
  onSessionState: (state: SessionState) => void;
  onError: (message: string) => void;
};

/** SDH WebRTC del navegador expone peerConnection y remoteMediaStream. */
type BrowserSdh = {
  peerConnection?: RTCPeerConnection;
  remoteMediaStream?: MediaStream;
};

function getBrowserSdh(session: Session | null): BrowserSdh | undefined {
  return session?.sessionDescriptionHandler as BrowserSdh | undefined;
}

function wssWithAdvisorToken(wssUrl: string): string {
  const token = tokenStore.get();
  if (!token || !wssUrl.includes('/ws/sip')) return wssUrl;
  const sep = wssUrl.includes('?') ? '&' : '?';
  return `${wssUrl}${sep}token=${encodeURIComponent(token)}`;
}

/** Softphone WebRTC (SIP.js) — el asesor solo ve nuestra ventana, no MicroSIP. */
export class AdvisorSipPhone {
  private ua: UserAgent | null = null;
  private registerer: Registerer | null = null;
  private session: Session | null = null;
  private remoteAudio: HTMLAudioElement | null = null;
  private config: WebRtcSipConfig | null = null;
  private callbacks: SipPhoneCallbacks | null = null;

  setCallbacks(callbacks: SipPhoneCallbacks): void {
    this.callbacks = callbacks;
  }

  attachRemoteAudio(el: HTMLAudioElement): void {
    this.remoteAudio = el;
  }

  async connect(config: WebRtcSipConfig): Promise<void> {
    if (this.ua) {
      await this.disconnect();
    }
    this.config = config;

    const uri = UserAgent.makeURI(`sip:${config.username}@${config.domain}`);
    if (!uri) throw new Error('URI SIP inválida.');

    const options: UserAgentOptions = {
      uri,
      displayName: config.displayName,
      authorizationUsername: config.username,
      authorizationPassword: config.authorizationPassword,
      transportOptions: { server: wssWithAdvisorToken(config.wssUrl) },
      sessionDescriptionHandlerFactory: Web.defaultSessionDescriptionHandlerFactory(),
      sessionDescriptionHandlerFactoryOptions: {
        constraints: { audio: true, video: false },
        peerConnectionConfiguration: {
          iceServers: config.stunServers.map((urls) => ({ urls })),
        },
      },
    };

    this.ua = new UserAgent(options);
    await this.ua.start();

    this.registerer = new Registerer(this.ua);
    await this.registerer.register();

    if (this.registerer.state !== RegistererState.Registered) {
      await new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(
          () => reject(new Error('Tiempo agotado al registrar la línea telefónica.')),
          15000,
        );
        this.registerer!.stateChange.addListener((state) => {
          if (state === RegistererState.Registered) {
            window.clearTimeout(timeout);
            resolve();
          }
        });
        if (this.registerer!.state === RegistererState.Registered) {
          window.clearTimeout(timeout);
          resolve();
        }
      });
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.hangup();
    } catch {
      /* ignore */
    }
    if (this.registerer) {
      try {
        await this.registerer.unregister();
      } catch {
        /* ignore */
      }
      this.registerer = null;
    }
    if (this.ua) {
      try {
        await this.ua.stop();
      } catch {
        /* ignore */
      }
      this.ua = null;
    }
    this.config = null;
  }

  async call(dialString: string): Promise<void> {
    if (!this.ua || !this.config) {
      throw new Error('Teléfono no conectado.');
    }

    await this.hangup();

    const target = UserAgent.makeURI(`sip:${dialString}@${this.config.domain}`);
    if (!target) throw new Error('Destino de marcación inválido.');

    const inviter = new Inviter(this.ua, target);
    this.session = inviter;
    this.bindSession(inviter);
    await inviter.invite();
  }

  async hangup(): Promise<void> {
    if (!this.session) return;
    const s = this.session;
    this.session = null;
    try {
      if (s.state === SessionState.Established) {
        await s.bye();
      } else if (
        s.state === SessionState.Establishing ||
        s.state === SessionState.Initial
      ) {
        await (s as Inviter).cancel();
      }
    } catch {
      /* session may already be gone */
    }
  }

  setMuted(muted: boolean): void {
    const pc = getBrowserSdh(this.session)?.peerConnection;
    if (!pc) return;
    for (const sender of pc.getSenders()) {
      if (sender.track?.kind === 'audio') {
        sender.track.enabled = !muted;
      }
    }
  }

  setSpeakerOn(on: boolean): void {
    if (this.remoteAudio) {
      this.remoteAudio.muted = !on;
    }
  }

  async sendDtmf(tone: string): Promise<void> {
    if (!this.session) return;
    const pc = getBrowserSdh(this.session)?.peerConnection;
    const sender = pc?.getSenders().find((x: RTCRtpSender) => x.track?.kind === 'audio');
    if (sender?.dtmf) {
      sender.dtmf.insertDTMF(tone, 100, 50);
    }
  }

  private bindSession(session: Session): void {
    session.stateChange.addListener((state) => {
      this.callbacks?.onSessionState(state);
      if (state === SessionState.Established) {
        this.attachRemoteStream(session);
      }
      if (state === SessionState.Terminated) {
        this.session = null;
      }
    });
  }

  private attachRemoteStream(session: Session): void {
    if (!this.remoteAudio) return;
    const sdh = getBrowserSdh(session);
    if (sdh?.remoteMediaStream) {
      this.remoteAudio.srcObject = sdh.remoteMediaStream;
      void this.remoteAudio.play().catch(() => {
        /* autoplay policy */
      });
      return;
    }
    const pc = sdh?.peerConnection;
    if (!pc) return;
    const stream = new MediaStream();
    for (const receiver of pc.getReceivers()) {
      if (receiver.track) stream.addTrack(receiver.track);
    }
    this.remoteAudio.srcObject = stream;
    void this.remoteAudio.play().catch(() => {
      /* autoplay policy */
    });
  }
}

export function sessionStateToPhase(state: SessionState): 'connecting' | 'ringing' | 'active' | 'ended' {
  switch (state) {
    case SessionState.Initial:
    case SessionState.Establishing:
      return 'connecting';
    case SessionState.Established:
      return 'active';
    case SessionState.Terminating:
    case SessionState.Terminated:
      return 'ended';
    default:
      return 'connecting';
  }
}
