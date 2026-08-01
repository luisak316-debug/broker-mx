export const fmtDate = (iso: string) =>
  new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('es-MX', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });

export function clientFirstName(name: string): string {
  const first = name.trim().split(/\s+/).filter(Boolean)[0];
  if (!first) return name;
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

export function isoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function shiftDays(base: Date, delta: number): Date {
  const d = new Date(base);
  d.setDate(d.getDate() + delta);
  return d;
}

export const fmtDateTime = (iso: string) =>
  new Date(iso).toLocaleString('es-MX', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

export function fmtMonthYear(year: number, month: number): string {
  return new Date(year, month - 1, 1).toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric',
  });
}

export function fmtYear(year: number): string {
  return String(year);
}
