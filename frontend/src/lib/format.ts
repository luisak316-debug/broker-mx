const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const num = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 4 });
const pct = new Intl.NumberFormat('es-MX', {
  style: 'percent',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const fmtMxn = (v: number) => mxn.format(v);
export const fmtCurrency = (v: number, currency: string) =>
  currency === 'MXN' ? mxn.format(v) : currency === 'USD' ? usd.format(v) : `${num.format(v)} ${currency}`;
export const fmtNum = (v: number) => num.format(v);
export const fmtPct = (v: number) => pct.format(v / 100);
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' });
export const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

export const fmtPhone = (phone?: string) => {
  const digits = (phone ?? '').replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone ?? '';
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
};

export const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  INE: 'INE / Credencial para votar',
  PASAPORTE: 'Pasaporte',
  COMPROBANTE_DOMICILIO: 'Comprobante de domicilio',
  CONSTANCIA_FISCAL: 'Constancia fiscal (RFC)',
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
};
