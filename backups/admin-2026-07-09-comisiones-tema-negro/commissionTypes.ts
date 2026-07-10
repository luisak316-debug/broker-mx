import { fmtMxn } from './format';

export type CommissionType = 'CUSTODIA' | 'GESTION_ANUAL';
export type ManagementPeriod = 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL';

export const COMMISSION_TYPE_ROWS: Array<{
  type: CommissionType;
  label: string;
  description: string;
  example: string;
  pctMin: number;
  pctMax: number;
  pctStep: number;
}> = [
  {
    type: 'CUSTODIA',
    label: 'Mantenimiento o custodia',
    description:
      'Cargo por mantener operaciones abiertas (financiamiento nocturno / custodia de posición), habitual en CFD y forex.',
    example: '0,2% sobre $50,000 nocional abierto → $100',
    pctMin: 0.1,
    pctMax: 0.4,
    pctStep: 0.05,
  },
  {
    type: 'GESTION_ANUAL',
    label: 'Cuota interna de gestión anual',
    description:
      'Comisión sobre patrimonio en cuenta (saldo + invertido) cuando el capital permanece administrado — práctica estándar en cuentas gestionadas.',
    example: '2% anual trimestral sobre $200,000 AUM → $1,000',
    pctMin: 1,
    pctMax: 2.75,
    pctStep: 0.05,
  },
];

export const COMMISSION_TYPE_LABEL: Record<CommissionType, string> = Object.fromEntries(
  COMMISSION_TYPE_ROWS.map((r) => [r.type, r.label]),
) as Record<CommissionType, string>;

export const MANAGEMENT_PERIOD_OPTIONS: Array<{ value: ManagementPeriod; label: string }> = [
  { value: 'MENSUAL', label: 'Mensual (1/12 del anual)' },
  { value: 'TRIMESTRAL', label: 'Trimestral (1/4 del anual)' },
  { value: 'ANUAL', label: 'Anual completo' },
];

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function periodFactor(period: ManagementPeriod): number {
  if (period === 'MENSUAL') return 1 / 12;
  if (period === 'ANUAL') return 1;
  return 1 / 4;
}

export interface CommissionPreviewInput {
  cashMxn: number;
  totalInvestedMxn: number;
  openPositionsNotionalMxn: number;
}

export interface CommissionPreviewResult {
  type: CommissionType;
  percentage: number;
  period?: ManagementPeriod;
  baseMxn: number;
  totalMxn: number;
  lines: string[];
}

export function previewCommission(
  type: CommissionType,
  client: CommissionPreviewInput,
  percentage: number,
  period: ManagementPeriod = 'TRIMESTRAL',
): CommissionPreviewResult | null {
  const row = COMMISSION_TYPE_ROWS.find((r) => r.type === type);
  if (!row || percentage < row.pctMin || percentage > row.pctMax) return null;

  const lines: string[] = [];

  if (type === 'CUSTODIA') {
    if (client.openPositionsNotionalMxn <= 0) return null;
    const total = round2((client.openPositionsNotionalMxn * percentage) / 100);
    lines.push(`Operaciones abiertas: ${client.openPositionsNotionalMxn > 0 ? fmtMxn(client.openPositionsNotionalMxn) : '$0.00'} nocional`);
    lines.push(`${percentage}% sobre posiciones abiertas = ${fmtMxn(total)}`);
    return {
      type,
      percentage,
      baseMxn: client.openPositionsNotionalMxn,
      totalMxn: total,
      lines,
    };
  }

  const aumMxn = round2(client.cashMxn + client.totalInvestedMxn);
  if (aumMxn <= 0) return null;
  const factor = periodFactor(period);
  const total = round2((aumMxn * percentage * factor) / 100);
  const periodLabel =
    MANAGEMENT_PERIOD_OPTIONS.find((p) => p.value === period)?.label ?? period;
  lines.push(`Patrimonio en cuenta (AUM): ${fmtMxn(aumMxn)}`);
  lines.push(`Tasa anual: ${percentage}% · periodo: ${periodLabel}`);
  lines.push(`Comisión del periodo = ${fmtMxn(total)}`);
  return {
    type,
    percentage,
    period,
    baseMxn: aumMxn,
    totalMxn: total,
    lines,
  };
}

export function commissionFormValid(
  type: CommissionType,
  client: CommissionPreviewInput,
  percentage: number,
  percentageValid: boolean,
  reason: string,
  period: ManagementPeriod,
): boolean {
  if (reason.trim().length < 5 || !percentageValid) return false;
  return previewCommission(type, client, percentage, period) !== null;
}
