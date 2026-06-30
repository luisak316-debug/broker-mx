import type { Request, Response } from 'express';
import { z } from 'zod';
import { findClient, updateClientBalances } from '../../repositories/client.repository';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';
import { fmtMxn } from '../../utils/format';

const balanceSchema = z.object({
  cashMxn: z.number().min(0).optional(),
  totalInvestedMxn: z.number().min(0).optional(),
  reason: z.string().min(5, 'La razón del ajuste es obligatoria (mínimo 5 caracteres).'),
});

export async function updateBalance(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.id);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  const { cashMxn, totalInvestedMxn, reason } = balanceSchema.parse(req.body);
  if (cashMxn === undefined && totalInvestedMxn === undefined) {
    throw new HttpError(400, 'No se indicó ningún campo a modificar.');
  }

  const before = { cashMxn: client.cashMxn, totalInvestedMxn: client.totalInvestedMxn };
  const changes: string[] = [];
  if (cashMxn !== undefined && cashMxn !== client.cashMxn) {
    changes.push(`saldo de ${fmtMxn(client.cashMxn)} a ${fmtMxn(cashMxn)}`);
  }
  if (totalInvestedMxn !== undefined && totalInvestedMxn !== client.totalInvestedMxn) {
    changes.push(
      `total invertido de ${fmtMxn(client.totalInvestedMxn)} a ${fmtMxn(totalInvestedMxn)}`,
    );
  }

  const updated = await updateClientBalances(client.id, { cashMxn, totalInvestedMxn });
  if (!updated) throw new HttpError(404, 'Cliente no encontrado.');

  const after = { cashMxn: updated.cashMxn, totalInvestedMxn: updated.totalInvestedMxn };

  const audit = await record({
    actor: req.staff!,
    action: 'BALANCE_UPDATE',
    targetUserId: client.id,
    description: `${req.staff!.name} modificó el ${changes.join(' y ')} del cliente ${client.displayName}. Razón: ${reason}`,
    before,
    after,
    ip: clientIp(req),
  });

  res.json({ data: { client: updated, audit } });
}

const fundsSchema = z.object({
  operation: z.enum(['add', 'remove']),
  amountMxn: z.number().positive('El monto debe ser mayor a cero.'),
  reason: z.string().min(5, 'La razón del ajuste es obligatoria (mínimo 5 caracteres).'),
});

export async function adjustFunds(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.id);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  const { operation, amountMxn, reason } = fundsSchema.parse(req.body);
  const before = { cashMxn: client.cashMxn };

  if (operation === 'remove' && amountMxn > client.cashMxn) {
    throw new HttpError(400, 'No se pueden remover más fondos que el saldo disponible.');
  }

  const nextCash = round2(client.cashMxn + (operation === 'add' ? amountMxn : -amountMxn));
  const updated = await updateClientBalances(client.id, { cashMxn: nextCash });
  if (!updated) throw new HttpError(404, 'Cliente no encontrado.');

  const after = { cashMxn: updated.cashMxn };
  const verbo = operation === 'add' ? 'agregó' : 'removió';

  const audit = await record({
    actor: req.staff!,
    action: operation === 'add' ? 'FUNDS_ADD' : 'FUNDS_REMOVE',
    targetUserId: client.id,
    description: `${req.staff!.name} ${verbo} ${fmtMxn(amountMxn)} ${operation === 'add' ? 'a' : 'de'} la cuenta de ${client.displayName} (saldo: ${fmtMxn(before.cashMxn)} → ${fmtMxn(after.cashMxn)}). Razón: ${reason}`,
    before,
    after,
    ip: clientIp(req),
  });

  res.json({ data: { client: updated, audit } });
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
