import { useEffect, useRef, useState } from 'react';
import { getWsPricesUrl } from '../lib/apiConfig';
import type { Quote } from '../types';

/**
 * Suscripción al feed de precios en tiempo real vía WebSocket.
 * Reconecta automáticamente. Si se pasa `symbols`, filtra el flujo.
 */
export function useLivePrices(symbols?: string[]): {
  quotes: Record<string, Quote>;
  connected: boolean;
} {
  const [quotes, setQuotes] = useState<Record<string, Quote>>({});
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const symbolsKey = symbols?.join(',') ?? '*';

  useEffect(() => {
    let closed = false;
    let retry: ReturnType<typeof setTimeout>;

    function connect() {
      const ws = new WebSocket(getWsPricesUrl());
      wsRef.current = ws;

      ws.onopen = () => {
        setConnected(true);
        ws.send(JSON.stringify({ type: 'subscribe', symbols: symbols?.length ? symbols : '*' }));
      };
      ws.onmessage = (ev) => {
        try {
          const msg = JSON.parse(ev.data);
          if (msg.type === 'quotes') {
            setQuotes((prev) => {
              const next = { ...prev };
              for (const q of msg.data as Quote[]) next[q.symbol] = q;
              return next;
            });
          }
        } catch {
          /* ignore */
        }
      };
      ws.onclose = () => {
        setConnected(false);
        if (!closed) retry = setTimeout(connect, 2000);
      };
      ws.onerror = () => ws.close();
    }

    connect();
    return () => {
      closed = true;
      clearTimeout(retry);
      wsRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbolsKey]);

  return { quotes, connected };
}
