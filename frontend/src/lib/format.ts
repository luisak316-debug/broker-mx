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

/** Formato legible del celular mexicano (10 dígitos). */
export const fmtPhone = (phone?: string) => {
  const digits = (phone ?? '').replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone ?? '';
  return `${digits.slice(0, 2)} ${digits.slice(2, 6)} ${digits.slice(6)}`;
};
