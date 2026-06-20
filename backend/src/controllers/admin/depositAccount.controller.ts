import type { Request, Response } from 'express';
import { z } from 'zod';
import { findClient } from '../../data/adminStore';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';
import { fmtMxn } from '../../utils/format';
import type { DepositAccount } from '../../types/admin';

const depositSchema = z.object({
  beneficiary: z.string().min(3, 'El beneficiario / razón social es obligatorio.'),
  bank: z.string().min(2, 'El banco receptor es obligatorio.'),
  accountNumber: z
    .string()
    .regex(/^\d{5,20}$/, 'El número de cuenta debe contener solo dígitos (5 a 20).'),
  clabe: z
    .string()
    .regex(/^\d{18}$/, 'La CLABE interbancaria debe tener exactamente 18 dígitos.'),
  reference: z.string().min(1, 'La referencia única de pago es obligatoria.'),
  // Monto inicial de inversión: opcional. Si se captura, se refleja al cliente.
  initialInvestmentMxn: z.number().nonnegative('El monto no puede ser negativo.').optional(),
});

/** Asigna, modifica o reemplaza dinámicamente la cuenta de depósito del cliente. */
export function updateDepositAccount(req: Request, res: Response): void {
  const client = findClient(req.params.id);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  const parsed = depositSchema.parse(req.body);
  const before = client.depositAccount ?? null;

  const next: DepositAccount = {
    ...parsed,
    updatedAt: new Date().toISOString(),
    updatedByName: req.staff!.name,
  };
  client.depositAccount = next;

  const verbo = before ? 'modificó' : 'asignó';
  const montoTxt =
    next.initialInvestmentMxn !== undefined
      ? ` · Monto inicial sugerido: ${fmtMxn(next.initialInvestmentMxn)}`
      : '';
  const audit = record({
    actor: req.staff!,
    action: before ? 'DEPOSIT_ACCOUNT_UPDATE' : 'DEPOSIT_ACCOUNT_ASSIGN',
    targetUserId: client.id,
    description:
      `${req.staff!.name} ${verbo} la cuenta de depósito de ${client.displayName}: ` +
      `${next.bank} · CLABE ${maskClabe(next.clabe)} · Ref. ${next.reference}${montoTxt}`,
    before,
    after: next,
    ip: clientIp(req),
  });

  res.json({ data: { depositAccount: next, audit } });
}

function maskClabe(clabe: string): string {
  return `****${clabe.slice(-4)}`;
}
