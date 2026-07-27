import dgram from 'node:dgram';
import type { IncomingMessage } from 'node:http';
import { WebSocket, WebSocketServer, type RawData } from 'ws';
import { sipTelephony } from '../config/sipTelephony';
import {
  decodeWsPayload,
  encodeKeepaliveResponse,
  encodeSipFrame,
} from '../lib/sipRfc7118';
import type { SessionPayload } from '../services/security.service';

type BridgeSession = {
  ws: WebSocket;
  udp: dgram.Socket;
  staffEmail: string;
};

function attachUdpToWs(session: BridgeSession): void {
  const { ws, udp, staffEmail } = session;
  const targetHost = sipTelephony.udpHost!;
  const targetPort = sipTelephony.udpPort;

  udp.on('message', (msg) => {
    if (ws.readyState !== WebSocket.OPEN) return;
    try {
      ws.send(encodeSipFrame(msg.toString('utf8')), { binary: true });
    } catch {
      /* socket closing */
    }
  });

  udp.on('error', (err) => {
    console.error('[sip-bridge] UDP error', staffEmail, err.message);
    ws.close(1011, 'Error de transporte SIP');
  });

  ws.on('message', (raw: RawData) => {
    const buf = Buffer.isBuffer(raw) ? raw : Buffer.from(raw as ArrayBuffer);
    const payload = decodeWsPayload(buf);
    if (payload.kind === 'keepalive') {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(encodeKeepaliveResponse(), { binary: true });
      }
      return;
    }
    if (payload.kind !== 'sip') return;

    udp.send(Buffer.from(payload.message, 'utf8'), targetPort, targetHost, (err) => {
      if (err) {
        console.error('[sip-bridge] send UDP failed', staffEmail, err.message);
      }
    });
  });

  ws.on('close', () => {
    try {
      udp.close();
    } catch {
      /* already closed */
    }
  });

  ws.on('error', () => {
    try {
      udp.close();
    } catch {
      /* ignore */
    }
  });
}

function openBridgeSession(ws: WebSocket, staff: SessionPayload): void {
  const udp = dgram.createSocket('udp4');
  const session: BridgeSession = { ws, udp, staffEmail: staff.email };

  udp.bind(0, () => {
    attachUdpToWs(session);
    console.log(
      `[sip-bridge] ${staff.email} → UDP ${sipTelephony.udpHost}:${sipTelephony.udpPort}`,
    );
  });
}

export function attachSipWebSocketBridge(wss: WebSocketServer): void {
  wss.on('connection', (ws: WebSocket, _req: IncomingMessage, staff?: SessionPayload) => {
    if (!staff) {
      ws.close(1008, 'No autenticado');
      return;
    }
    openBridgeSession(ws, staff);
  });
}

export function createSipBridgeWebSocketServer(): WebSocketServer {
  return new WebSocketServer({
    noServer: true,
    handleProtocols: (protocols) => (protocols.has('sip') ? 'sip' : false),
  });
}
