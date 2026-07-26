export function normalizeContactPhoneE164(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  const digits = trimmed.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 15) return null;
  return `+${digits}`;
}

export function isValidContactPhoneE164(raw: string): boolean {
  return normalizeContactPhoneE164(raw) !== null;
}
