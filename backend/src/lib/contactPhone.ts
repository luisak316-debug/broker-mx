/** Teléfono internacional de contacto (E.164) — supervisor pega +código y número. */

export function normalizeContactPhoneE164(raw: string): string | null {
  const trimmed = raw.trim().replace(/[\u200B-\u200D\uFEFF]/g, '');
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  return `+${digits}`;
}

export function isValidContactPhoneE164(raw: string): boolean {
  return normalizeContactPhoneE164(raw) !== null;
}

/** Enmascara conservando código de país y últimos 4 dígitos. */
export function maskContactPhoneE164(raw: string | null | undefined): string {
  const n = raw ? normalizeContactPhoneE164(raw) : null;
  if (!n) return '—';
  const digits = n.slice(1);
  const last4 = digits.slice(-4);
  const cc = digits.slice(0, Math.max(0, digits.length - 10));
  if (!cc) return `******${last4}`;
  return `+${cc} ******${last4}`;
}

/** E.164 almacenado → cadena para MicroSIP (segundo número en la marcación). */
export function contactPhoneToE164(stored: string): string {
  const n = normalizeContactPhoneE164(stored);
  if (!n) throw new Error('Teléfono de contacto inválido.');
  return n;
}
