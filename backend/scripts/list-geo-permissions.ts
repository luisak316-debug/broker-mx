/**
 * Lista países con SMS habilitado en Twilio (Geo Permissions).
 * Uso: npm run sms:geo --workspace backend
 */
import dotenv from 'dotenv';
import path from 'node:path';
import { LATAM_COUNTRIES } from '../src/data/latamCountries';

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const sid = process.env.TWILIO_ACCOUNT_SID?.trim();
const token = process.env.TWILIO_AUTH_TOKEN?.trim();

function fail(msg: string): never {
  console.error(`\n  [X] ${msg}\n`);
  process.exit(1);
}

if (!sid || !token) {
  fail('Faltan TWILIO_ACCOUNT_SID y TWILIO_AUTH_TOKEN en backend/.env');
}

type GeoPermission = {
  country_code?: string;
  enabled?: boolean;
  type?: string;
};

type GeoResponse = {
  permissions?: GeoPermission[];
};

async function fetchCountryPermission(countryCode: string): Promise<GeoPermission | null> {
  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const url = `https://accounts.twilio.com/v1/Messaging/GeoPermissions?CountryCode=${encodeURIComponent(countryCode)}`;
  const res = await fetch(url, {
    headers: { Authorization: `Basic ${auth}`, Accept: 'application/json' },
  });

  if (res.status === 404) return null;
  if (!res.ok) {
    const text = await res.text();
    fail(`Twilio ${countryCode}: ${res.status}. ${text.slice(0, 180)}`);
  }

  const data = (await res.json()) as GeoResponse;
  return data.permissions?.find((p) => p.country_code?.toUpperCase() === countryCode) ?? data.permissions?.[0] ?? null;
}

async function fetchGeoPermissions(): Promise<Map<string, GeoPermission>> {
  const map = new Map<string, GeoPermission>();

  // Twilio expone permiso por país; consultamos cada uno de LATAM.
  for (const c of LATAM_COUNTRIES) {
    const perm = await fetchCountryPermission(c.code);
    if (perm) map.set(c.code, perm);
  }

  return map;
}

async function main(): Promise<void> {
  console.log('\n  Broker.mx — Geo Permissions Twilio (SMS)\n');

  const permissions = await fetchGeoPermissions();
  const latamEnabled: string[] = [];
  const latamDisabled: string[] = [];
  const latamUnknown: string[] = [];

  for (const c of LATAM_COUNTRIES) {
    const p = permissions.get(c.code);
    const on = p?.enabled;
    const status =
      on === true ? 'ACTIVO' : on === false ? 'NO activo' : 'sin datos (revisa consola)';
    const line = `${c.flag} ${c.name.padEnd(20)} ${c.dialCode.padEnd(6)} ${c.code}  ${status}`;
    console.log(`  ${line}`);
    if (on === true) latamEnabled.push(`${c.name} ${c.dialCode}`);
    else if (on === false) latamDisabled.push(c.name);
    else latamUnknown.push(c.name);
  }

  console.log('\n  ─────────────────────────────────────────');
  console.log(`  LATAM activos en Twilio: ${latamEnabled.length}/${LATAM_COUNTRIES.length}`);
  if (latamEnabled.length) console.log(`  → ${latamEnabled.join(', ')}`);
  if (latamDisabled.length) console.log(`  Desactivados: ${latamDisabled.join(', ')}`);
  if (latamUnknown.length) {
    console.log(`  Sin respuesta API: ${latamUnknown.join(', ')} → revisa en consola Twilio`);
  }
  console.log('\n  Consola manual: Messaging → Settings → Geo Permissions');
  console.log('  Auditoría: Monitor → Insights → Audit → Event Type sms-geographic-permissions.*\n');
}

main().catch((err) => {
  console.error('\n  [X]', err instanceof Error ? err.message : err);
  process.exit(1);
});
