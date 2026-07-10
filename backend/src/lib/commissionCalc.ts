import { HttpError } from '../middleware/errorHandler';
import { fmtMxn } from '../utils/format';

/** Comisión por mantener operaciones abiertas (custodia / financiamiento). */
export type CommissionType = 'CUSTODIA' | 'GESTION_ANUAL';

/** Periodo de prorrateo para la cuota anual de gestión (práctica habitual en brokers). */
export type ManagementPeriod = 'MENSUAL' | 'TRIMESTRAL' | 'ANUAL';

export const COMMISSION_TYPE_LABEL: Record<CommissionType, string> = {
  CUSTODIA: 'Comisión de mantenimiento o custodia',
  GESTION_ANUAL: 'Cuota interna de gestión anual',
};

export const MANAGEMENT_PERIOD_LABEL: Record<ManagementPeriod, string> = {
  MENSUAL: 'Mensual (1/12 del anual)',
  TRIMESTRAL: 'Trimestral (1/4 del anual)',
  ANUAL: 'Anual completo',
};

const CUSTODIA_RANGE = { min: 0.1, max: 0.4 };
const GESTION_RANGE = { min: 1, max: 2.75 };

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

function periodFactor(period: ManagementPeriod): number {
  switch (period) {
    case 'MENSUAL':
      return 1 / 12;
    case 'TRIMESTRAL':
      return 1 / 4;
    case 'ANUAL':
      return 1;
    default:
      return 1 / 4;
  }
}

export interface CommissionCalcInput {
  cashMxn: number;
  totalInvestedMxn: number;
  openPositionsNotionalMxn: number;
}

export interface CommissionCalcResult {
  type: CommissionType;
  percentage: number;
  period?: ManagementPeriod;
  baseMxn: number;
  totalMxn: number;
  summary: string;
}

export function validateCommissionPercentage(type: CommissionType, percentage: number): void {
  if (type === 'CUSTODIA') {
    if (percentage < CUSTODIA_RANGE.min || percentage > CUSTODIA_RANGE.max) {
      throw new HttpError(
        400,
        `La comisión de custodia debe estar entre ${CUSTODIA_RANGE.min}% y ${CUSTODIA_RANGE.max}%.`,
      );
    }
    return;
  }
  if (percentage < GESTION_RANGE.min || percentage > GESTION_RANGE.max) {
    throw new HttpError(
      400,
      `La cuota de gestión anual debe estar entre ${GESTION_RANGE.min}% y ${GESTION_RANGE.max}%.`,
    );
  }
}

export function calculateCommission(
  type: CommissionType,
  client: CommissionCalcInput,
  percentage: number,
  period: ManagementPeriod = 'TRIMESTRAL',
): CommissionCalcResult {
  validateCommissionPercentage(type, percentage);

  if (type === 'CUSTODIA') {
    if (client.openPositionsNotionalMxn <= 0) {
      throw new HttpError(
        400,
        'El cliente no tiene operaciones abiertas para aplicar comisión de custodia.',
      );
    }
    const total = round2((client.openPositionsNotionalMxn * percentage) / 100);
    return {
      type,
      percentage,
      baseMxn: client.openPositionsNotionalMxn,
      totalMxn: total,
      summary: `${percentage}% sobre nocional abierto ${fmtMxn(client.openPositionsNotionalMxn)} (${fmtMxn(total)})`,
    };
  }

  const aumMxn = round2(client.cashMxn + client.totalInvestedMxn);
  if (aumMxn <= 0) {
    throw new HttpError(
      400,
      'El cliente no tiene patrimonio en cuenta (saldo + invertido) para aplicar la cuota de gestión.',
    );
  }

  const factor = periodFactor(period);
  const total = round2((aumMxn * percentage * factor) / 100);
  const periodLabel = MANAGEMENT_PERIOD_LABEL[period].toLowerCase();

  return {
    type,
    percentage,
    period,
    baseMxn: aumMxn,
    totalMxn: total,
    summary: `${percentage}% anual (${periodLabel}) sobre patrimonio ${fmtMxn(aumMxn)} (${fmtMxn(total)})`,
  };
}
