import { fmtMxn } from './format';

export type BonusType = 'DEPOSITO' | 'FIJO' | 'SALDO' | 'INVERTIDO';

export const BONUS_TYPE_ROWS: Array<{
  type: BonusType;
  label: string;
  description: string;
  example: string;
  usesAmount: boolean;
  usesPercentage: boolean | 'optional';
}> = [
  {
    type: 'DEPOSITO',
    label: 'Bono sobre depósito',
    description: 'Match promocional sobre un monto base (depósito o promoción).',
    example: 'Base $1,000 + 20% → bono $1,200',
    usesAmount: true,
    usesPercentage: 'optional',
  },
  {
    type: 'FIJO',
    label: 'Bono fijo',
    description: 'Monto plano acreditado al cliente.',
    example: '$500 de bienvenida',
    usesAmount: true,
    usesPercentage: false,
  },
  {
    type: 'SALDO',
    label: '% sobre saldo disponible',
    description: 'Porcentaje sobre el efectivo actual en la cuenta.',
    example: '10% de $8,000 de saldo → $800',
    usesAmount: false,
    usesPercentage: true,
  },
  {
    type: 'INVERTIDO',
    label: '% sobre total invertido',
    description: 'Porcentaje sobre el capital invertido del cliente.',
    example: '5% de $20,000 invertidos → $1,000',
    usesAmount: false,
    usesPercentage: true,
  },
];

export const BONUS_TYPE_LABEL: Record<BonusType, string> = Object.fromEntries(
  BONUS_TYPE_ROWS.map((r) => [r.type, r.label]),
) as Record<BonusType, string>;

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export interface BonusPreviewInput {
  cashMxn: number;
  totalInvestedMxn: number;
}

export interface BonusPreviewResult {
  type: BonusType;
  totalMxn: number;
  percentPartMxn: number;
  baseMxn: number;
  amountMxn: number;
  percentage: number;
  lines: string[];
}

export function previewBonus(
  type: BonusType,
  client: BonusPreviewInput,
  amountMxn: number,
  percentage: number,
): BonusPreviewResult | null {
  const lines: string[] = [];

  switch (type) {
    case 'FIJO': {
      if (amountMxn <= 0) return null;
      lines.push(`Bono fijo: ${fmtMxn(amountMxn)}`);
      return {
        type,
        totalMxn: round2(amountMxn),
        percentPartMxn: 0,
        baseMxn: amountMxn,
        amountMxn,
        percentage: 0,
        lines,
      };
    }
    case 'DEPOSITO': {
      if (amountMxn <= 0) return null;
      const percentPart = percentage > 0 ? round2((amountMxn * percentage) / 100) : 0;
      const total = round2(amountMxn + percentPart);
      lines.push(`Cantidad base: ${fmtMxn(amountMxn)}`);
      if (percentage > 0) {
        lines.push(`${percentage}% sobre la base = ${fmtMxn(percentPart)}`);
      }
      return {
        type,
        totalMxn: total,
        percentPartMxn: percentPart,
        baseMxn: amountMxn,
        amountMxn,
        percentage,
        lines,
      };
    }
    case 'SALDO': {
      if (percentage <= 0 || client.cashMxn <= 0) return null;
      const total = round2((client.cashMxn * percentage) / 100);
      lines.push(`Saldo disponible: ${fmtMxn(client.cashMxn)}`);
      lines.push(`${percentage}% del saldo = ${fmtMxn(total)}`);
      return {
        type,
        totalMxn: total,
        percentPartMxn: total,
        baseMxn: client.cashMxn,
        amountMxn: 0,
        percentage,
        lines,
      };
    }
    case 'INVERTIDO': {
      if (percentage <= 0 || client.totalInvestedMxn <= 0) return null;
      const total = round2((client.totalInvestedMxn * percentage) / 100);
      lines.push(`Total invertido: ${fmtMxn(client.totalInvestedMxn)}`);
      lines.push(`${percentage}% del invertido = ${fmtMxn(total)}`);
      return {
        type,
        totalMxn: total,
        percentPartMxn: total,
        baseMxn: client.totalInvestedMxn,
        amountMxn: 0,
        percentage,
        lines,
      };
    }
    default:
      return null;
  }
}

export function bonusFormValid(
  type: BonusType,
  client: BonusPreviewInput,
  amountMxn: number,
  percentage: number,
  percentageValid: boolean,
  reason: string,
): boolean {
  if (reason.trim().length < 5 || !percentageValid) return false;
  return previewBonus(type, client, amountMxn, percentage) !== null;
}
