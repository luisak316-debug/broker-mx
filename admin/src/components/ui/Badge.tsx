const MAP: Record<string, string> = {
  // Estado de cuenta
  ACTIVA: 'bg-ok/15 text-ok',
  SUSPENDIDA: 'bg-warn/15 text-warn',
  BLOQUEADA: 'bg-danger/15 text-danger',
  CERRADA: 'bg-slate-500/15 text-slate-400',
  // KYC
  APPROVED: 'bg-ok/15 text-ok',
  IN_REVIEW: 'bg-warn/15 text-warn',
  PENDING: 'bg-slate-500/15 text-slate-400',
  REJECTED: 'bg-danger/15 text-danger',
  // Solicitudes
  APROBADA: 'bg-ok/15 text-ok',
  PENDIENTE: 'bg-warn/15 text-warn',
  RECHAZADA: 'bg-danger/15 text-danger',
  // Tipo
  DEPOSITO: 'bg-brand-500/15 text-brand-100',
  RETIRO: 'bg-slate-500/15 text-slate-300',
};

const LABEL: Record<string, string> = {
  IN_REVIEW: 'EN REVISIÓN',
  APPROVED: 'APROBADO',
  PENDING: 'PENDIENTE',
  REJECTED: 'RECHAZADO',
};

export function Badge({ value }: { value: string }) {
  return <span className={`badge ${MAP[value] ?? 'bg-slate-500/15 text-slate-300'}`}>{LABEL[value] ?? value}</span>;
}
