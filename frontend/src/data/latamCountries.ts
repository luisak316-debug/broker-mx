/** Países de Latinoamérica — registro Broker.mx (espejo del backend) */
export interface LatamCountry {
  code: string;
  name: string;
  dialCode: string;
  phoneLength: number | [number, number];
  currency: string;
  locale: string;
  phonePlaceholder: string;
  flag: string;
}

export const LATAM_COUNTRIES: LatamCountry[] = [
  { code: 'MX', name: 'México', dialCode: '+52', phoneLength: 10, currency: 'MXN', locale: 'es-MX', phonePlaceholder: '5512345678', flag: '🇲🇽' },
  { code: 'CL', name: 'Chile', dialCode: '+56', phoneLength: 9, currency: 'CLP', locale: 'es-CL', phonePlaceholder: '912345678', flag: '🇨🇱' },
  { code: 'CO', name: 'Colombia', dialCode: '+57', phoneLength: 10, currency: 'COP', locale: 'es-CO', phonePlaceholder: '3001234567', flag: '🇨🇴' },
  { code: 'AR', name: 'Argentina', dialCode: '+54', phoneLength: 10, currency: 'ARS', locale: 'es-AR', phonePlaceholder: '1123456789', flag: '🇦🇷' },
  { code: 'PE', name: 'Perú', dialCode: '+51', phoneLength: 9, currency: 'PEN', locale: 'es-PE', phonePlaceholder: '912345678', flag: '🇵🇪' },
  { code: 'BR', name: 'Brasil', dialCode: '+55', phoneLength: 11, currency: 'BRL', locale: 'pt-BR', phonePlaceholder: '11987654321', flag: '🇧🇷' },
  { code: 'EC', name: 'Ecuador', dialCode: '+593', phoneLength: 9, currency: 'USD', locale: 'es-EC', phonePlaceholder: '991234567', flag: '🇪🇨' },
  { code: 'GT', name: 'Guatemala', dialCode: '+502', phoneLength: 8, currency: 'GTQ', locale: 'es-GT', phonePlaceholder: '51234567', flag: '🇬🇹' },
  { code: 'CR', name: 'Costa Rica', dialCode: '+506', phoneLength: 8, currency: 'CRC', locale: 'es-CR', phonePlaceholder: '83123456', flag: '🇨🇷' },
  { code: 'PA', name: 'Panamá', dialCode: '+507', phoneLength: 8, currency: 'USD', locale: 'es-PA', phonePlaceholder: '61234567', flag: '🇵🇦' },
  { code: 'UY', name: 'Uruguay', dialCode: '+598', phoneLength: 8, currency: 'UYU', locale: 'es-UY', phonePlaceholder: '94123456', flag: '🇺🇾' },
  { code: 'PY', name: 'Paraguay', dialCode: '+595', phoneLength: 9, currency: 'PYG', locale: 'es-PY', phonePlaceholder: '981234567', flag: '🇵🇾' },
  { code: 'BO', name: 'Bolivia', dialCode: '+591', phoneLength: 8, currency: 'BOB', locale: 'es-BO', phonePlaceholder: '71234567', flag: '🇧🇴' },
  { code: 'DO', name: 'Rep. Dominicana', dialCode: '+1', phoneLength: 10, currency: 'DOP', locale: 'es-DO', phonePlaceholder: '8095551234', flag: '🇩🇴' },
  { code: 'SV', name: 'El Salvador', dialCode: '+503', phoneLength: 8, currency: 'USD', locale: 'es-SV', phonePlaceholder: '71234567', flag: '🇸🇻' },
  { code: 'HN', name: 'Honduras', dialCode: '+504', phoneLength: 8, currency: 'HNL', locale: 'es-HN', phonePlaceholder: '91234567', flag: '🇭🇳' },
  { code: 'NI', name: 'Nicaragua', dialCode: '+505', phoneLength: 8, currency: 'NIO', locale: 'es-NI', phonePlaceholder: '81234567', flag: '🇳🇮' },
  { code: 'VE', name: 'Venezuela', dialCode: '+58', phoneLength: 10, currency: 'USD', locale: 'es-VE', phonePlaceholder: '4121234567', flag: '🇻🇪' },
];

const byCode = new Map(LATAM_COUNTRIES.map((c) => [c.code, c]));

export function getLatamCountry(code: string): LatamCountry {
  return byCode.get(code.toUpperCase()) ?? LATAM_COUNTRIES[0];
}

export function normalizeNationalPhone(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function isValidNationalPhone(country: LatamCountry, national: string): boolean {
  const digits = normalizeNationalPhone(national);
  if (Array.isArray(country.phoneLength)) {
    return digits.length >= country.phoneLength[0] && digits.length <= country.phoneLength[1];
  }
  return digits.length === country.phoneLength;
}

export function phoneLengthHint(country: LatamCountry): string {
  if (Array.isArray(country.phoneLength)) {
    return `${country.phoneLength[0]}–${country.phoneLength[1]} dígitos`;
  }
  return `${country.phoneLength} dígitos`;
}

export function maxPhoneDigits(country: LatamCountry): number {
  return Array.isArray(country.phoneLength) ? country.phoneLength[1] : country.phoneLength;
}

export function formatNationalPhone(countryCode: string, national: string): string {
  const country = getLatamCountry(countryCode);
  const d = normalizeNationalPhone(national);
  return `${country.dialCode} ${d}`;
}
