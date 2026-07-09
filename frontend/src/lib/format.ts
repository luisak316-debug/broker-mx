import { getLatamCountry } from '../data/latamCountries';

const formatters = new Map<string, Intl.NumberFormat>();

function currencyFormatter(currency: string, locale: string): Intl.NumberFormat {
  const key = `${locale}:${currency}`;
  let fmt = formatters.get(key);
  if (!fmt) {
    try {
      fmt = new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 });
    } catch {
      fmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
    }
    formatters.set(key, fmt);
  }
  return fmt;
}

const num = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 4 });
const pct = new Intl.NumberFormat('es-MX', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const fmtMxn = (v: number) => currencyFormatter('MXN', 'es-MX').format(v);

export const fmtCurrency = (v: number, currency: string, countryCode?: string) => {
  const cc = countryCode?.toUpperCase();
  const locale = cc ? getLatamCountry(cc).locale : 'es-MX';
  return currencyFormatter(currency, locale).format(v);
};

export const fmtNum = (v: number) => num.format(v);
export const fmtPct = (v: number) => pct.format(v / 100);
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' });
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const fmtPhone = (phone?: string, countryCode = 'MX') => {
  const d = (phone ?? '').replace(/\D/g, '');
  if (!d) return phone ?? '';
  const country = getLatamCountry(countryCode);
  return `${country.dialCode} ${d}`;
};

export const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  INE: 'INE / Credencial para votar',
  PASAPORTE: 'Pasaporte',
  CONSTANCIA_FISCAL: 'Constancia fiscal (RFC)',
};

/** Tipos de identidad que el cliente puede subir desde su cuenta. */
export const IDENTITY_DOCUMENT_TYPES = ['INE', 'PASAPORTE'] as const;

export const DOCUMENT_SIDE_LABEL: Record<string, string> = {
  ANVERSO: 'Frente',
  REVERSO: 'Reverso',
};

export const KYC_STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendiente',
  IN_REVIEW: 'En revisión',
  APPROVED: 'Aprobado',
  REJECTED: 'Rechazado',
};

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

/** Primer nombre — solo en listas/tablas admin y supervisores donde el nombre completo no cabe. */
export function clientFirstName(name: string): string {
  const first = name.trim().split(/\s+/).filter(Boolean)[0];
  if (!first) return name;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}
