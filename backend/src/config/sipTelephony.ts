/** Credenciales SIP — solo backend / Render env. Nunca en el frontend estático. */

function req(name: string): string | undefined {
  const v = process.env[name]?.trim();
  return v || undefined;
}

function num(value: string | undefined, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** WSS nativo del proveedor (WebRTC). Descubierto: rdx.narayana.im:8089/ws */
const PROVIDER_WSS: Record<string, string> = {
  'rdx.narayana.im': 'wss://rdx.narayana.im:8089/ws',
};

export const sipTelephony = {
  /** Override manual. Si vacío, se usa WSS del proveedor o puente embebido. */
  wssUrl: req('SIP_WSS_URL'),
  /** Puente WSS→UDP en esta API (solo respaldo; no transcodifica audio WebRTC). */
  bridgeEnabled: process.env.SIP_BRIDGE_ENABLED === 'true',
  udpHost: req('SIP_UDP_HOST') ?? req('SIP_DOMAIN'),
  udpPort: num(process.env.SIP_UDP_PORT, 5060),
  publicApiUrl: req('PUBLIC_API_URL'),
  domain: req('SIP_DOMAIN'),
  username: req('SIP_USERNAME'),
  password: req('SIP_PASSWORD'),
  stunServers: (process.env.SIP_STUN_SERVERS ?? 'stun:stun.l.google.com:19302')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
};

function providerWssUrl(): string | undefined {
  if (!sipTelephony.domain) return undefined;
  return PROVIDER_WSS[sipTelephony.domain];
}

/** WSS que usará SIP.js en el navegador del asesor. */
export function resolveAdvisorWssUrl(): string | undefined {
  if (sipTelephony.wssUrl) return sipTelephony.wssUrl;
  const native = providerWssUrl();
  if (native) return native;
  if (!sipTelephony.bridgeEnabled || !sipTelephony.publicApiUrl) return undefined;
  const wsBase = sipTelephony.publicApiUrl.replace(/^http/i, (match) =>
    match.toLowerCase() === 'https' ? 'wss' : 'ws',
  );
  return `${wsBase.replace(/\/$/, '')}/ws/sip`;
}

export function isSipBridgeReady(): boolean {
  return Boolean(
    sipTelephony.bridgeEnabled &&
      !sipTelephony.wssUrl &&
      !providerWssUrl() &&
      sipTelephony.udpHost &&
      sipTelephony.publicApiUrl,
  );
}

export function isSipWebRtcConfigured(): boolean {
  return Boolean(
    resolveAdvisorWssUrl() &&
      sipTelephony.domain &&
      sipTelephony.username &&
      sipTelephony.password,
  );
}

export type SipBridgeMode = 'provider' | 'embedded' | 'custom';

export function sipBridgeMode(): SipBridgeMode {
  if (sipTelephony.wssUrl && !providerWssUrl()) return 'custom';
  if (providerWssUrl() && !sipTelephony.wssUrl) return 'provider';
  if (isSipBridgeReady()) return 'embedded';
  return 'custom';
}
