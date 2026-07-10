const MAP: Record<string, string> = {
  APROBADA: 'bg-ok/15 text-ok',
  PENDIENTE: 'bg-warn/15 text-warn',
  RECHAZADA: 'bg-danger/15 text-danger',
  DEPOSITO: 'bg-brand-500/15 text-brand-100',
  RETIRO: 'bg-slate-500/15 text-slate-300',
};

export function Badge({ value }: { value: string }) {
  return (
    <span className={`badge ${MAP[value] ?? 'bg-slate-500/15 text-slate-300'}`}>{value}</span>
  );
}
