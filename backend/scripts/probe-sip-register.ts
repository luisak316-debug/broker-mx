/**
 * Registro SIP de prueba contra wss://rdx.narayana.im:8089/ws
 * Requiere SIP_USERNAME + SIP_PASSWORD en backend/.env
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  Registerer,
  RegistererState,
  UserAgent,
  Web,
} from 'sip.js';

function loadDotEnv(): void {
  try {
    const raw = readFileSync(resolve(__dirname, '../.env'), 'utf8');
    for (const line of raw.split('\n')) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const i = t.indexOf('=');
      if (i < 1) continue;
      const k = t.slice(0, i);
      const v = t.slice(i + 1).trim();
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {
    /* no .env */
  }
}

loadDotEnv();

const domain = process.env.SIP_DOMAIN ?? 'rdx.narayana.im';
const username = process.env.SIP_USERNAME ?? '21011';
const password = process.env.SIP_PASSWORD;
const wssUrl = process.env.SIP_WSS_URL ?? `wss://${domain}:8089/ws`;

async function main(): Promise<void> {
  if (!password) {
    console.error('Falta SIP_PASSWORD en backend/.env');
    process.exit(1);
  }

  console.log('Registrando', username, '@', domain, 'via', wssUrl);

  const uri = UserAgent.makeURI(`sip:${username}@${domain}`);
  if (!uri) throw new Error('URI inválida');

  const ua = new UserAgent({
    uri,
    authorizationUsername: username,
    authorizationPassword: password,
    transportOptions: { server: wssUrl },
    sessionDescriptionHandlerFactory: Web.defaultSessionDescriptionHandlerFactory(),
  });

  await ua.start();
  const reg = new Registerer(ua);
  await reg.register();

  await new Promise((r) => setTimeout(r, 3000));
  console.log('Estado registro:', reg.state);

  if (reg.state === RegistererState.Registered) {
    console.log('OK — registro SIP WebRTC del proveedor funciona');
    await reg.unregister();
    await ua.stop();
    process.exit(0);
  }

  console.error('FALLO — no registrado');
  await ua.stop();
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
