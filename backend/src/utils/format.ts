const mxn = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' });

export function fmtMxn(value: number): string {
  return mxn.format(value);
}
