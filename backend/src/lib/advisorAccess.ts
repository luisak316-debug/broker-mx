/** Acceso numérico del portal asesores (sin correos reales). Único por asesor activo. */

const ACCESS_EMAIL_DOMAIN = 'access.invermax.internal';export const ADVISOR_ACCESS_MIN_DIGITS = 4;
export const ADVISOR_ACCESS_MAX_DIGITS = 24;

export function normalizeAdvisorLoginAccess(raw: string): string {
  const access = raw.replace(/\s+/g, '').trim();
  const re = new RegExp(`^\\d{${ADVISOR_ACCESS_MIN_DIGITS},${ADVISOR_ACCESS_MAX_DIGITS}}$`);
  if (!re.test(access)) {
    throw new Error(
      `El acceso debe ser numérico (${ADVISOR_ACCESS_MIN_DIGITS}–${ADVISOR_ACCESS_MAX_DIGITS} dígitos).`,
    );
  }
  return access;
}

export function advisorInternalEmail(access: string): string {
  return `${normalizeAdvisorLoginAccess(access)}@${ACCESS_EMAIL_DOMAIN}`;
}

export function titleCaseName(raw: string): string {
  return raw
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

export function advisorPublicAccess(staff: {
  loginAccess?: string | null;
  email: string;
}): string {
  if (staff.loginAccess) return staff.loginAccess;
  if (staff.email.endsWith(`@${ACCESS_EMAIL_DOMAIN}`)) {
    return staff.email.split('@')[0] ?? staff.email;
  }
  return staff.email;
}
