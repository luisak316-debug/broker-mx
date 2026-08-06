/** Mismo formato que el backend — acceso numérico → email interno para login legacy. */
const ACCESS_EMAIL_DOMAIN = 'access.invermax.internal';

export function advisorInternalEmail(access: string): string {
  const normalized = access.replace(/\s+/g, '').trim();
  return `${normalized}@${ACCESS_EMAIL_DOMAIN}`;
}
