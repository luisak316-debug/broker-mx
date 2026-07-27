/**
 * Prueba INVITE con cadena *8088*… (misma que MicroSIP).
 * Uso: npx tsx backend/scripts/probe-sip-invite.ts
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  Inviter,
  Registerer,
  SessionState,
  UserAgent,
  Web,
} from 'sip.js';

function loadDotEnv(): void {
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
}

loadDotEnv();

const domain = process.env.SIP_DOMAIN ?? 'rdx.narayana.im';
const username = process.env.SIP_USERNAME ?? '21011';
const password = process.env.SIP_PASSWORD!;
const wssUrl = process.env.SIP_WSS_URL ?? `wss://${domain}:8089/ws`;
const dialString =
  process.env.TEST_DIAL_STRING ?? '*8088*+13213405504*+528130747149*';

async function main(): Promise<void> {
  const uri = UserAgent.makeURI(`sip:${username}@${domain}`);
  if (!uri) throw new Error('URI cuenta inválida');

  const ua = new UserAgent({
    uri,
    authorizationUsername: username,
    authorizationPassword: password,
    transportOptions: { server: wssUrl },
    sessionDescriptionHandlerFactory: Web.defaultSessionDescriptionHandlerFactory(),
    sessionDescriptionHandlerFactoryOptions: {
      constraints: { audio: true, video: false },
    },
  });

  await ua.start();
  const reg = new Registerer(ua);
  await reg.register();
  console.log('Registrado. Probando URI para:', dialString);

  const attempts = [
    `sip:${dialString}@${domain}`,
    `sip:${encodeURI(dialString)}@${domain}`,
    `sip:${dialString.replace(/\+/g, '%2B')}@${domain}`,
  ];

  for (const attempt of attempts) {
    const target = UserAgent.makeURI(attempt);
    console.log('\n--- URI string:', attempt);
    console.log('makeURI:', target ? target.toString() : 'NULL');
    if (!target) continue;

    const inviter = new Inviter(ua, target);
    inviter.stateChange.addListener((s) => console.log('  state:', s));

    try {
      await Promise.race([
        inviter.invite({
          requestDelegate: {
            onProgress: (r) => console.log('  progress:', r.message.statusCode, r.message.reasonPhrase),
            onReject: (r) => console.log('  REJECT:', r.message.statusCode, r.message.reasonPhrase),
            onAccept: () => console.log('  ACCEPT'),
          },
        }),
        new Promise((_, rej) => setTimeout(() => rej(new Error('timeout 25s')), 25000)),
      ]);
      console.log('  invite() resolved, session:', inviter.state);
      if (inviter.state === SessionState.Established) {
        console.log('  OK — llamada establecida');
        await inviter.bye();
        break;
      }
      await inviter.cancel?.().catch(() => inviter.bye?.());
    } catch (e) {
      console.log('  error:', e instanceof Error ? e.message : e);
    }
    await new Promise((r) => setTimeout(r, 1500));
  }

  await reg.unregister();
  await ua.stop();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
