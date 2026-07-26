import { getLatamCountry, normalizeNationalPhone } from '../data/latamCountries';
import { MICROSIP_DIAL_PREFIX } from '../config/telephony';
import { pickRandomUsEmitter } from '../config/usEmitterPool';

function ensureE164(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith('+')) return trimmed;
  const digits = normalizeNationalPhone(trimmed);
  return digits ? `+${digits}` : trimmed;
}

/** Teléfono del cliente en E.164 según país registrado. */
export function clientPhoneToE164(countryCode: string, phone: string): string {
  const country = getLatamCountry(countryCode);
  const digits = normalizeNationalPhone(phone);
  return `${country.dialCode}${digits}`;
}

/** Teléfono MX (10 dígitos) → +52… */
export function mxContactPhoneToE164(phone: string): string {
  const digits = normalizeNationalPhone(phone).slice(-10);
  return `+52${digits}`;
}

/**
 * Cadena MicroSIP: *8088*+1{emisor US}*+{receptor internacional}*
 * Emisor US aleatorio del pool en cada llamada.
 */
export function buildMicroSipDialString(receiverE164: string, emitterE164?: string): string {
  const emitter = ensureE164(emitterE164 ?? pickRandomUsEmitter());
  const receiver = ensureE164(receiverE164);
  return `*${MICROSIP_DIAL_PREFIX}*${emitter}*${receiver}*`;
}

/** Enmascara teléfono MX de contacto (10 dígitos). */
export function maskMxContactPhone(phone: string | null | undefined): string {
  if (!phone) return '—';
  const d = normalizeNationalPhone(phone).slice(-10);
  if (d.length < 4) return '+52 ****';
  return `+52 ******${d.slice(-4)}`;
}

export function maskPhoneE164(countryCode: string, phone: string | null | undefined): string {
  if (!phone) return '—';
  const country = getLatamCountry(countryCode);
  const d = normalizeNationalPhone(phone);
  if (d.length < 4) return `${country.dialCode} ****`;
  return `${country.dialCode} ******${d.slice(-4)}`;
}
