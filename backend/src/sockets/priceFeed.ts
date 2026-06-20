import type { Server } from 'node:http';
import { WebSocketServer, WebSocket, type RawData } from 'ws';
import { marketData } from '../services/marketData.service';
import type { Quote } from '../types/market';

interface ClientState {
  symbols: Set<string> | null; // null = todos
}

/**
 * Feed de precios en tiempo real (24/7 para cripto, simulado para el resto).
 *
 * Protocolo de cliente:
 *  -> { "type": "subscribe", "symbols": ["BTC","USD/MXN"] }
 *  -> { "type": "subscribe", "symbols": "*" }   // todos
 *  <- { "type": "quotes", "data": Quote[] }
 */
export function attachPriceFeed(server: Server): WebSocketServer {
  const wss = new WebSocketServer({ server, path: '/ws/prices' });
  const clients = new Map<WebSocket, ClientState>();

  wss.on('connection', (ws: WebSocket) => {
    clients.set(ws, { symbols: null });

    // Envía un snapshot inmediato al conectar.
    ws.send(JSON.stringify({ type: 'quotes', data: marketData.getQuotes() }));

    ws.on('message', (raw: RawData) => {
      try {
        const msg = JSON.parse(raw.toString());
        if (msg.type === 'subscribe') {
          const state = clients.get(ws)!;
          state.symbols =
            msg.symbols === '*' || !Array.isArray(msg.symbols)
              ? null
              : new Set<string>(msg.symbols.map((s: string) => s.toUpperCase()));
        }
      } catch {
        ws.send(JSON.stringify({ type: 'error', message: 'Mensaje inválido' }));
      }
    });

    ws.on('close', () => clients.delete(ws));
    ws.on('error', () => clients.delete(ws));
  });

  marketData.onTick((quotes: Quote[]) => {
    for (const [ws, state] of clients) {
      if (ws.readyState !== WebSocket.OPEN) continue;
      const payload = state.symbols
        ? quotes.filter((q) => state.symbols!.has(q.symbol.toUpperCase()))
        : quotes;
      if (payload.length) ws.send(JSON.stringify({ type: 'quotes', data: payload }));
    }
  });

  return wss;
}
