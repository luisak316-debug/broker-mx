/** Marca, dominio y correos oficiales INVERMAX LATAM. */
export const BRAND_NAME = 'INVERMAX LATAM';
export const BRAND_DOMAIN = 'invermaxlatam.com';
export const PUBLIC_SITE_URL = `https://${BRAND_DOMAIN}`;
export const STAFF_EMAIL_DOMAIN = BRAND_DOMAIN;
export const CLIENT_PHONE_EMAIL_DOMAIN = `celular.${BRAND_DOMAIN}`;

export const STAFF_EMAILS = {
  admin: `admin@${STAFF_EMAIL_DOMAIN}`,
  supervisor: `supervisor@${STAFF_EMAIL_DOMAIN}`,
  advisor: `juan.perez@${STAFF_EMAIL_DOMAIN}`,
  compliance: `laura.cumplimiento@${STAFF_EMAIL_DOMAIN}`,
  support: `soporte@${STAFF_EMAIL_DOMAIN}`,
} as const;

/** Correos demo legacy → nuevos (migración en bootstrap). */
export const LEGACY_STAFF_EMAIL_MAP: Record<string, string> = {
  'admin@brokermx.com': STAFF_EMAILS.admin,
  'supervisor@brokermx.com': STAFF_EMAILS.supervisor,
  'juan.perez@brokermx.com': STAFF_EMAILS.advisor,
  'laura.cumplimiento@brokermx.com': STAFF_EMAILS.compliance,
  'soporte@brokermx.com': STAFF_EMAILS.support,
};

export function managerEmail(team: number): string {
  return `gerente${team}@${STAFF_EMAIL_DOMAIN}`;
}

export function isAdminEmail(email: string): boolean {
  return email.toLowerCase() === STAFF_EMAILS.admin;
}

export function smsVerificationBody(code: string): string {
  return `${BRAND_NAME}: tu codigo de verificacion es ${code}. Valido 10 min. No lo compartas.`;
}
