const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export const fmtMxn = (v: number) => mxn.format(v);
export const fmtDate = (iso: string) =>
  new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('es-MX', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Primer nombre — solo en listas/tablas admin y supervisores donde el nombre completo no cabe. */
export function clientFirstName(name: string): string {
  const first = name.trim().split(/\s+/).filter(Boolean)[0];
  if (!first) return name;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function fmtPhone(phone?: string): string {
  const digits = (phone ?? '').replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone ?? '—';
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
}

export function shiftDays(base: Date, delta: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}
