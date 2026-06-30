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
  return d.toISOString().slice(0, 10);
}

export function shiftDays(base: Date, delta: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}
