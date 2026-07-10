import { HttpError } from '../middleware/errorHandler';
import { fmtMxn } from '../utils/format';

export type BonusType = 'DEPOSITO' | 'FIJO' | 'SALDO' | 'INVERTIDO';

export const BONUS_TYPE_LABEL: Record<BonusType, string> = {
  DEPOSITO: 'Bono sobre depósito',
  FIJO: 'Bono fijo',
  SALDO: '% sobre saldo disponible',
  INVERTIDO: '% sobre total invertido',
};

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}

export interface BonusCalcInput {
  cashMxn: number;
  totalInvestedMxn: number;
}

export interface BonusCalcResult {
  type: BonusType;
  amountMxn: number;
  percentage: number;
  percentPartMxn: number;
  baseMxn: number;
  totalMxn: number;
  summary: string;
}

export function calculateBonus(
  type: BonusType,
  client: BonusCalcInput,
  amountMxn: number,
  percentage: number,
): BonusCalcResult {
  switch (type) {
    case 'FIJO': {
      if (amountMxn <= 0) {
        throw new HttpError(400, 'Indica una cantidad mayor a cero para el bono fijo.');
      }
      return {
        type,
        amountMxn,
        percentage: 0,
        percentPartMxn: 0,
        baseMxn: amountMxn,
        totalMxn: round2(amountMxn),
        summary: `bono fijo ${fmtMxn(amountMxn)}`,
      };
    }
    case 'DEPOSITO': {
      if (amountMxn <= 0) {
        throw new HttpError(400, 'Indica la cantidad base del depósito o promoción.');
      }
      const percentPart = percentage > 0 ? round2((amountMxn * percentage) / 100) : 0;
      const total = round2(amountMxn + percentPart);
      const parts = [`base ${fmtMxn(amountMxn)}`];
      if (percentage > 0) parts.push(`${percentage}% sobre la base (${fmtMxn(percentPart)})`);
      return {
        type,
        amountMxn,
        percentage,
        percentPartMxn: percentPart,
        baseMxn: amountMxn,
        totalMxn: total,
        summary: parts.join(' + '),
      };
    }
    case 'SALDO': {
      if (percentage <= 0) {
        throw new HttpError(400, 'Indica un porcentaje mayor a cero.');
      }
      if (client.cashMxn <= 0) {
        throw new HttpError(400, 'El cliente no tiene saldo disponible para calcular este bono.');
      }
      const total = round2((client.cashMxn * percentage) / 100);
      return {
        type,
        amountMxn: 0,
        percentage,
        percentPartMxn: total,
        baseMxn: client.cashMxn,
        totalMxn: total,
        summary: `${percentage}% sobre saldo ${fmtMxn(client.cashMxn)} (${fmtMxn(total)})`,
      };
    }
    case 'INVERTIDO': {
      if (percentage <= 0) {
        throw new HttpError(400, 'Indica un porcentaje mayor a cero.');
      }
      if (client.totalInvestedMxn <= 0) {
        throw new HttpError(400, 'El cliente no tiene capital invertido para calcular este bono.');
      }
      const total = round2((client.totalInvestedMxn * percentage) / 100);
      return {
        type,
        amountMxn: 0,
        percentage,
        percentPartMxn: total,
        baseMxn: client.totalInvestedMxn,
        totalMxn: total,
        summary: `${percentage}% sobre invertido ${fmtMxn(client.totalInvestedMxn)} (${fmtMxn(total)})`,
      };
    }
    default:
      throw new HttpError(400, 'Tipo de bono no válido.');
  }
}
