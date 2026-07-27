import type { Server, IncomingMessage } from 'node:http';
import { WebSocketServer } from 'ws';
import { isSipBridgeReady } from '../config/sipTelephony';
import { verifyToken, type SessionPayload } from '../services/security.service';
import { pathnameFromUpgrade, registerPriceFeed } from './priceFeed';
import { attachSipWebSocketBridge, createSipBridgeWebSocketServer } from './sipWebSocketBridge';

function parseToken(req: IncomingMessage): string | null {
  const host = req.headers.host ?? 'localhost';
  try {
    return new URL(req.url ?? '/', `http://${host}`).searchParams.get('token');
  } catch {
    return null;
  }
}

function verifyAdvisorToken(token: string | null): SessionPayload | null {
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload) return null;
  if (payload.role !== 'ADVISOR' && payload.role !== 'ADMIN') return null;
  return payload;
}

export function attachWebSockets(server: Server): void {
  const priceWss = new WebSocketServer({ noServer: true });
  registerPriceFeed(priceWss);

  const sipBridgeActive = isSipBridgeReady();
  const sipWss = sipBridgeActive ? createSipBridgeWebSocketServer() : null;
  if (sipWss) {
    attachSipWebSocketBridge(sipWss);
  }

  server.on('upgrade', (req, socket, head) => {
    const pathname = pathnameFromUpgrade(req);

    if (pathname === '/ws/prices') {
      priceWss.handleUpgrade(req, socket, head, (ws) => {
        priceWss.emit('connection', ws, req);
      });
      return;
    }

    if (pathname === '/ws/sip') {
      if (!sipWss) {
        socket.write('HTTP/1.1 503 Service Unavailable\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
      }
      const staff = verifyAdvisorToken(parseToken(req));
      if (!staff) {
        socket.write('HTTP/1.1 401 Unauthorized\r\nConnection: close\r\n\r\n');
        socket.destroy();
        return;
      }
      sipWss.handleUpgrade(req, socket, head, (ws) => {
        sipWss.emit('connection', ws, req, staff);
      });
      return;
    }

    socket.destroy();
  });
}
