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
  onRinging: () => void;
  onError: (message: string) => void;
};

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

function dialTargetUri(dialString: string, domain: string) {
  return UserAgent.makeURI(`sip:${dialString}@${domain}`);
}

/** Softphone WebRTC (SIP.js) — el asesor solo ve nuestra ventana, no MicroSIP. */
export class AdvisorSipPhone {
  private ua: UserAgent | null = null;
  private registerer: Registerer | null = null;
  private session: Session | null = null;
  private remoteAudio: HTMLAudioElement | null = null;
  private localStream: MediaStream | null = null;
  private config: WebRtcSipConfig | null = null;
  private callbacks: SipPhoneCallbacks | null = null;
  private hangupRequested = false;

  setCallbacks(callbacks: SipPhoneCallbacks): void {
    this.callbacks = callbacks;
  }

  attachRemoteAudio(el: HTMLAudioElement): void {
    this.remoteAudio = el;
  }

  async connect(config: WebRtcSipConfig, localStream: MediaStream): Promise<void> {
    if (this.ua) {
      await this.disconnect();
    }
    this.config = config;
    this.localStream = localStream;

    const uri = UserAgent.makeURI(`sip:${config.username}@${config.domain}`);
    if (!uri) throw new Error('URI SIP inválida.');

    const streamForCall = localStream;
    const options: UserAgentOptions = {
      uri,
      displayName: config.displayName,
      authorizationUsername: config.username,
      authorizationPassword: config.authorizationPassword,
      transportOptions: { server: wssWithAdvisorToken(config.wssUrl) },
      sessionDescriptionHandlerFactory: Web.defaultSessionDescriptionHandlerFactory(
        () => Promise.resolve(streamForCall),
      ),
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
    this.localStream = null;
  }

  async call(dialString: string): Promise<void> {
    if (!this.ua || !this.config || !this.localStream) {
      throw new Error('Teléfono no conectado.');
    }

    await this.hangup();

    this.hangupRequested = false;
    const target = dialTargetUri(dialString, this.config.domain);
    if (!target) throw new Error('Destino de marcación inválido.');

    const inviter = new Inviter(this.ua, target);
    this.session = inviter;
    this.bindSession(inviter);

    await new Promise<void>((resolve, reject) => {
      let settled = false;
      const finish = (fn: () => void) => {
        if (settled) return;
        settled = true;
        fn();
      };

      const timeout = window.setTimeout(() => {
        finish(() =>
          reject(
            new Error(
              'Sin respuesta al marcar. Cierra MicroSIP si está abierto e intenta otra vez.',
            ),
          ),
        );
      }, 65000);

      inviter.stateChange.addListener((state) => {
        this.callbacks?.onSessionState(state);
        if (state === SessionState.Established) {
          window.clearTimeout(timeout);
          finish(resolve);
        }
        if (state === SessionState.Terminated) {
          window.clearTimeout(timeout);
          if (this.hangupRequested) {
            finish(resolve);
            return;
          }
          finish(() =>
            reject(
              new Error(
                'La llamada no conectó. Verifica que MicroSIP no esté usando la misma línea.',
              ),
            ),
          );
        }
      });

      void inviter
        .invite({
          sessionDescriptionHandlerOptions: {
            constraints: { audio: true, video: false },
          },
          requestDelegate: {
            onProgress: (response) => {
              const code = response.message.statusCode;
              if (code === 180 || code === 183) {
                this.callbacks?.onRinging();
              }
            },
            onReject: (response) => {
              window.clearTimeout(timeout);
              const code = response.message.statusCode;
              const reason = response.message.reasonPhrase ?? 'rechazada';
              finish(() => reject(new Error(`Llamada rechazada (${code} ${reason})`)));
            },
          },
        })
        .catch((err: unknown) => {
          window.clearTimeout(timeout);
          finish(() =>
            reject(err instanceof Error ? err : new Error('Error al enviar la llamada.')),
          );
        });
    });
  }

  async hangup(): Promise<void> {
    if (!this.session) return;
    this.hangupRequested = true;
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
    if (this.localStream) {
      for (const track of this.localStream.getAudioTracks()) {
        track.enabled = !muted;
      }
    }
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
      void this.remoteAudio.play().catch(() => undefined);
      return;
    }
    const pc = sdh?.peerConnection;
    if (!pc) return;
    const stream = new MediaStream();
    for (const receiver of pc.getReceivers()) {
      if (receiver.track) stream.addTrack(receiver.track);
    }
    this.remoteAudio.srcObject = stream;
    void this.remoteAudio.play().catch(() => undefined);
  }
}

export function sessionStateToPhase(
  state: SessionState,
): 'connecting' | 'ringing' | 'active' | 'ended' {
  switch (state) {
    case SessionState.Initial:
      return 'connecting';
    case SessionState.Establishing:
      return 'ringing';
    case SessionState.Established:
      return 'active';
    case SessionState.Terminating:
    case SessionState.Terminated:
      return 'ended';
    default:
      return 'connecting';
  }
}
