/**
 * Verifica credenciales Twilio sin mostrar el token.
 * Uso: npx tsx scripts/verify-sms.ts [celular10digitos]
 * Si pasas celular, envia un SMS de prueba.
 */
import dotenv from 'dotenv';
import twilio from 'twilio';
import path from 'node:path';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
const token = process.env.TWILIO_AUTH_TOKEN?.trim();
const from = process.env.TWILIO_FROM_NUMBER?.trim();
const testPhone = process.argv[2]?.replace(/\D/g, '').slice(-10);

function fail(msg: string): never {
  console.error(`\n  [X] ${msg}\n`);
  process.exit(1);
}

if (!sid || sid.length < 10) {
  fail('Falta TWILIO_ACCOUNT_SID en backend/.env');
}
if (!token || token.length < 10) {
  fail('Falta TWILIO_AUTH_TOKEN en backend/.env');
}
if (!from || !from.startsWith('+')) {
  fail('Falta TWILIO_FROM_NUMBER en backend/.env (formato +1XXXXXXXXXX)');
}

async function main(): Promise<void> {
  console.log('\n  Broker.mx — SMS\n');

  const client = twilio(sid!, token!);
  const account = await client.api.accounts(sid!).fetch();
  console.log(`  [OK] Cuenta Twilio: ${account.friendlyName ?? sid}`);
  console.log(`  [OK] Estado: ${account.status}`);
  console.log(`  [OK] Numero remitente: ${from}`);

  if (!testPhone) {
    console.log('\n  Credenciales correctas. Para probar envio:');
    console.log('  npm run sms:verify -- 5512345678');
    console.log('  (usa tu celular de 10 digitos)\n');
    return;
  }

  if (!/^\d{10}$/.test(testPhone)) {
    fail('Celular de prueba invalido. Usa 10 digitos, ej. 5512345678');
  }

  const code = String(Math.floor(100_000 + Math.random() * 900_000));
  const to = `+52${testPhone}`;
  await client.messages.create({
    to,
    from: from!,
    body: `Broker.mx prueba: tu codigo es ${code}.`,
  });

  console.log(`\n  [OK] SMS de prueba enviado a ${to}`);
  console.log('  Revisa tu celular en unos segundos.\n');
}

main().catch((err: { code?: number; message?: string }) => {
  const code = err?.code;
  const msg = err?.message ?? '';

  if (msg.includes('Test Account Credentials') || code === 20008) {
    fail(
      'Pegaste las credenciales de PRUEBA (Test), no las REALES (Live).\n' +
        '  En console.twilio.com usa la caja "Account Info" del Dashboard:\n' +
        '  - Account SID (Live)\n' +
        '  - Auth Token (Live) -> Show -> Copy\n' +
        '  NO uses la seccion "Test Account Credentials".',
    );
  }
  if (code === 20003 || code === 20403) {
    fail('Credenciales incorrectas. Revisa Account SID y Auth Token LIVE en Twilio.');
  }
  if (code === 21608) {
    fail('Cuenta trial: verifica el celular en Twilio > Verified Caller IDs.');
  }
  if (code === 21408) {
    fail('Activa Mexico en Twilio > Messaging > Geo permissions.');
  }
  console.error('\n  [X]', msg || err);
  process.exit(1);
});
