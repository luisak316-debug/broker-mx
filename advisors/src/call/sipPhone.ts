import {
  Inviter,
  Registerer,
  RegistererState,
  Session,
  SessionState,
  SIPExtension,
  UserAgent,
  Web,
  type UserAgentOptions,
} from 'sip.js';
import { tokenStore } from '../api/client';
import type { WebRtcSipConfig } from './types';

export type SipPhoneCallbacks = {
  onSessionState: (state: SessionState) => void;
  onRinging: () => void;
  onStatus: (detail: string) => void;
  onError: (message: string) => void;
};

type BrowserSdh = {
  peerConnection?: RTCPeerConnection;
  remoteMediaStream?: MediaStream;
  setDescription?: (sdp: string, type: RTCSdpType) => Promise<void>;
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

type RegisterDoneDelegate = {
  onAccept?: () => void;
  onReject?: () => void;
};

/** SIP.js resuelve register/unregister antes de la respuesta final — hay que esperar onAccept/onReject. */
function waitRegisterResponse(
  run: (delegate: RegisterDoneDelegate) => Promise<unknown>,
  timeoutMs = 12000,
): Promise<void> {
  return new Promise((resolve) => {
    const timeout = window.setTimeout(() => resolve(), timeoutMs);
    const done = () => {
      window.clearTimeout(timeout);
      resolve();
    };
    void run({
      onAccept: done,
      onReject: done,
    }).catch(() => done());
  });
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
  private opChain: Promise<void> = Promise.resolve();

  private enqueue<T>(fn: () => Promise<T>): Promise<T> {
    const next = this.opChain.then(fn, fn);
    this.opChain = next.then(
      () => undefined,
      () => undefined,
    );
    return next;
  }

  private async clearOtherSoftphones(ua: UserAgent): Promise<void> {
    const boot = new Registerer(ua);
    try {
      await waitRegisterResponse((delegate) =>
        boot.unregister({ all: true, requestDelegate: delegate }),
      );
    } catch {
      /* sin registros previos */
    } finally {
      await boot.dispose();
    }
  }

  setCallbacks(callbacks: SipPhoneCallbacks): void {
    this.callbacks = callbacks;
  }

  attachRemoteAudio(el: HTMLAudioElement): void {
    this.remoteAudio = el;
  }

  async connect(config: WebRtcSipConfig, localStream: MediaStream): Promise<void> {
    return this.enqueue(() => this.connectInternal(config, localStream));
  }

  private async connectInternal(config: WebRtcSipConfig, localStream: MediaStream): Promise<void> {
    if (this.ua) {
      await this.disconnectInternal();
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
      userAgentString: 'INVERMAX-WebPhone/1.0',
      forceRport: true,
      sipExtension100rel: SIPExtension.Supported,
      transportOptions: { server: wssWithAdvisorToken(config.wssUrl) },
      sessionDescriptionHandlerFactory: Web.defaultSessionDescriptionHandlerFactory(
        () => Promise.resolve(streamForCall),
      ),
      sessionDescriptionHandlerFactoryOptions: {
        constraints: { audio: true, video: false },
        iceGatheringTimeout: 10000,
        peerConnectionConfiguration: {
          iceServers: config.stunServers.map((urls) => ({ urls })),
          bundlePolicy: 'max-bundle',
          rtcpMuxPolicy: 'require',
        },
      },
    };

    this.ua = new UserAgent(options);
    await this.ua.start();

    await this.clearOtherSoftphones(this.ua);

    this.registerer = new Registerer(this.ua);
    await waitRegisterResponse((delegate) =>
      this.registerer!.register({ requestDelegate: delegate }),
    );

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
    return this.enqueue(() => this.disconnectInternal());
  }

  private async disconnectInternal(): Promise<void> {
    try {
      await this.hangup();
    } catch {
      /* ignore */
    }
    if (this.registerer) {
      const reg = this.registerer;
      this.registerer = null;
      try {
        await waitRegisterResponse((delegate) =>
          reg.unregister({ requestDelegate: delegate }),
        );
      } catch {
        /* ignore */
      }
      await reg.dispose();
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
    if (!this.ua || !this.config) {
      throw new Error('Teléfono no conectado.');
    }

    if (
      !this.localStream ||
      this.localStream.getAudioTracks().length === 0 ||
      this.localStream.getAudioTracks().every((t) => t.readyState === 'ended')
    ) {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });
    }

    await this.hangup();

    this.hangupRequested = false;
    const target = dialTargetUri(dialString, this.config.domain);
    if (!target) throw new Error('Destino de marcación inválido.');

    this.callbacks?.onStatus(`Marcando ${dialString.slice(0, 24)}…`);

    const inviter = new Inviter(this.ua, target);
    this.session = inviter;
    this.bindSession(inviter);

    let sipResponded = false;

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
              sipResponded
                ? 'Tiempo agotado sin conectar con el destino.'
                : 'No se pudo iniciar la señal de llamada. Recarga con Ctrl+F5 e intenta de nuevo.',
            ),
          ),
        );
      }, 45000);

      inviter.stateChange.addListener((state) => {
        this.callbacks?.onSessionState(state);
        if (state === SessionState.Establishing) {
          sipResponded = true;
          this.callbacks?.onStatus('Enviando señal al operador…');
        }
        if (state === SessionState.Established) {
          window.clearTimeout(timeout);
          this.callbacks?.onStatus('Conectado');
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
                sipResponded
                  ? 'La llamada terminó sin conectar. Revisa el código SIP en pantalla.'
                  : 'No se pudo enviar la llamada (error de audio o red). Recarga con Ctrl+F5.',
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
          requestOptions: {
            extraHeaders: [
              `P-Asserted-Identity: <sip:${this.config!.username}@${this.config!.domain}>`,
            ],
          },
          requestDelegate: {
            onTrying: () => {
              sipResponded = true;
              this.callbacks?.onStatus('100 Enviando llamada…');
            },
            onProgress: (response) => {
              sipResponded = true;
              const code = response.message.statusCode;
              const reason = response.message.reasonPhrase ?? '';
              this.callbacks?.onStatus(`${code} ${reason}`.trim());
              if (code === 180 || code === 183) {
                this.callbacks?.onRinging();
                void this.tryAttachEarlyMedia(inviter, response.message.body);
              }
            },
            onReject: (response) => {
              sipResponded = true;
              window.clearTimeout(timeout);
              const code = response.message.statusCode;
              const reason = response.message.reasonPhrase ?? 'rechazada';
              finish(() => reject(new Error(`Operador rechazó la llamada (${code} ${reason})`)));
            },
            onAccept: (response) => {
              sipResponded = true;
              this.callbacks?.onStatus(`Aceptada ${response.message.statusCode}`);
            },
          },
        })
        .catch((err: unknown) => {
          window.clearTimeout(timeout);
          const raw = err instanceof Error ? err.message : 'Error al enviar la llamada.';
          const msg =
            /getOffer|getDescription|MediaStream|audio/i.test(raw)
              ? 'No se pudo preparar el audio. Recarga la página (Ctrl+F5) y permite el micrófono.'
              : raw;
          finish(() => reject(new Error(msg)));
        });
    });
  }

  private async tryAttachEarlyMedia(inviter: Inviter, body: string | undefined): Promise<void> {
    if (!body || !this.remoteAudio) return;
    const sdh = getBrowserSdh(inviter);
    if (!sdh?.setDescription) return;
    try {
      await sdh.setDescription(body, 'answer');
      this.attachRemoteStream(inviter);
    } catch {
      /* early media opcional */
    }
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
    if (sdh?.remoteMediaStream && sdh.remoteMediaStream.getTracks().length > 0) {
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
    if (stream.getTracks().length === 0) return;
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
