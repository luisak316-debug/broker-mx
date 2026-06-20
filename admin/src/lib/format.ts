const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });
const num = new Intl.NumberFormat('es-MX', { maximumFractionDigits: 2 });

export const fmtMxn = (v: number) => mxn.format(v);
export const fmtNum = (v: number) => num.format(v);
export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: '2-digit' });
export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export const CATEGORY_LABEL: Record<string, string> = {
  stock: 'Bolsa de Valores',
  commodity: 'Materias Primas',
  forex: 'Divisas (Forex)',
  crypto: 'Criptomonedas',
};

export const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  ADVISOR: 'Asesor / Trader',
  COMPLIANCE: 'Cumplimiento',
  SUPPORT: 'Soporte',
};

export const DOCUMENT_TYPE_LABEL: Record<string, string> = {
  INE: 'INE / Credencial para votar',
  PASAPORTE: 'Pasaporte',
  COMPROBANTE_DOMICILIO: 'Comprobante de domicilio',
  CONSTANCIA_FISCAL: 'Constancia fiscal (RFC)',
};

/** Formatea un monto mientras se escribe: 10000 → 10,000 · 5000.50 → 5,000.50 */
export function formatMoneyInput(raw: string): string {
  const stripped = raw.replace(/,/g, '').replace(/[^\d.]/g, '');
  const dotIndex = stripped.indexOf('.');
  let intPart = dotIndex >= 0 ? stripped.slice(0, dotIndex) : stripped;
  const decPart =
    dotIndex >= 0 ? stripped.slice(dotIndex + 1).replace(/\./g, '').slice(0, 2) : '';
  const trailingDot = stripped.endsWith('.') && dotIndex === stripped.length - 1;

  intPart = intPart.replace(/\D/g, '');
  if (!intPart && !decPart && !trailingDot) return '';

  const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  if (trailingDot) return `${withCommas}.`;
  if (decPart) return `${withCommas}.${decPart}`;
  return withCommas;
}

/** Convierte "10,000" o "5,000.50" a número para guardar en la API. */
export function parseMoneyInput(formatted: string): number | undefined {
  const trimmed = formatted.trim();
  if (!trimmed) return undefined;
  const normalized = trimmed.replace(/,/g, '');
  const n = Number(normalized);
  return Number.isFinite(n) ? n : undefined;
}

/** Muestra un número guardado con separadores de miles (ej. 50000 → 50,000). */
export function formatMoneyDisplay(value: number): string {
  return formatMoneyInput(String(value));
}
