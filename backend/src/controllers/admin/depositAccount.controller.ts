import type { Request, Response } from 'express';
import { z } from 'zod';
import { findClient, updateDepositAccountFields } from '../../repositories/client.repository';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';
import { fmtMxn } from '../../utils/format';

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
  initialInvestmentMxn: z.number().nonnegative('El monto no puede ser negativo.').optional(),
});

export async function updateDepositAccount(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.id);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  const parsed = depositSchema.parse(req.body);
  const before = client.depositAccount ?? null;

  const updated = await updateDepositAccountFields(client.id, {
    beneficiary: parsed.beneficiary,
    bank: parsed.bank,
    accountNumber: parsed.accountNumber,
    clabe: parsed.clabe,
    reference: parsed.reference,
    staffId: req.staff!.sub,
  });
  if (!updated) throw new HttpError(404, 'Cliente no encontrado.');

  const next = {
    ...updated.depositAccount!,
    initialInvestmentMxn: parsed.initialInvestmentMxn,
    updatedByName: req.staff!.name,
  };

  const verbo = before ? 'modificó' : 'asignó';
  const montoTxt =
    parsed.initialInvestmentMxn !== undefined
      ? ` · Monto inicial sugerido: ${fmtMxn(parsed.initialInvestmentMxn)}`
      : '';

  const audit = await record({
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
