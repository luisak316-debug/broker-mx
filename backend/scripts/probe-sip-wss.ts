/**
 * Prueba WSS del proveedor SIP (rdx.narayana.im:8089).
 * Uso: npx tsx backend/scripts/probe-sip-wss.ts
 */
import WebSocket from 'ws';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

function loadDotEnv(): void {
  try {
    const raw = readFileSync(resolve(__dirname, '../.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim();
    }
  } catch {
    /* no .env */
  }
}

loadDotEnv();

const host = process.env.SIP_DOMAIN ?? 'rdx.narayana.im';
const port = process.env.SIP_WSS_PORT ?? '8089';
const url = process.env.SIP_WSS_URL ?? `wss://${host}:${port}`;

console.log('Probando', url, '…');

const ws = new WebSocket(url, 'sip', { rejectUnauthorized: false });

const timer = setTimeout(() => {
  console.log('TIMEOUT — sin respuesta en 8s');
  ws.close();
  process.exit(1);
}, 8000);

ws.on('open', () => {
  console.log('OK — WebSocket SIP abierto');
  clearTimeout(timer);
  ws.close();
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('ERROR', err.message);
  clearTimeout(timer);
  process.exit(1);
});
