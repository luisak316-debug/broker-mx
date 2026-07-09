import dotenv from 'dotenv';
import path from 'node:path';
import twilio from 'twilio';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
const token = process.env.TWILIO_AUTH_TOKEN?.trim();

async function main() {
  if (!sid || !token) {
    console.error('Faltan credenciales Twilio en backend/.env');
    process.exit(1);
  }

  const client = twilio(sid, token);
  const types = [
    'sms-geographic-permissions.updated',
    'sms-geographic-permissions.created',
    'sms-geographic-permissions.deleted',
  ] as const;

  console.log('\n  Auditoría Twilio — cambios Geo Permissions\n');

  let total = 0;
  for (const eventType of types) {
    const events = await client.monitor.v1.events.list({ eventType, limit: 50 });
    for (const e of events) {
      total++;
      const when = e.eventDate instanceof Date ? e.eventDate.toISOString() : String(e.eventDate);
      console.log(`  ${when}  ${eventType}`);
      if (e.eventData) console.log(`    ${JSON.stringify(e.eventData)}`);
    }
  }

  if (total === 0) {
    console.log('  No hay eventos recientes en Monitor API.');
    console.log('  Revisa manualmente: console.twilio.com → Messaging → Settings → Geo Permissions\n');
  } else {
    console.log(`\n  Total eventos: ${total}\n`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
