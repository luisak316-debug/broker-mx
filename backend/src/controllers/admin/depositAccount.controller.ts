import type { Request, Response } from 'express';
import { z } from 'zod';
import { findClient, updateDepositAccountFields } from '../../repositories/client.repository';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';
import { fmtMxn } from '../../utils/format';
import type { DepositMethod } from '../../types/admin';

const depositSchema = z
  .object({
    depositMethod: z.enum(['TRANSFERENCIA', 'VENTANILLA']),
    beneficiary: z.string().min(3, 'El beneficiario / razón social es obligatorio.'),
    bank: z.string().min(2, 'El banco receptor es obligatorio.'),
    accountNumber: z.string().optional().default(''),
    clabe: z.string().optional().default(''),
    reference: z.string().min(1, 'La referencia única de pago es obligatoria.'),
    initialInvestmentMxn: z.number().nonnegative('El monto no puede ser negativo.').optional(),
  })
  .superRefine((data, ctx) => {
    if (data.depositMethod === 'TRANSFERENCIA') {
      if (!/^\d{18}$/.test(data.clabe)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['clabe'],
          message: 'Para transferencia/SPEI la CLABE interbancaria debe tener 18 dígitos.',
        });
      }
    } else if (!/^\d{5,20}$/.test(data.accountNumber)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['accountNumber'],
        message: 'Para depósito en ventanilla el número de cuenta debe tener entre 5 y 20 dígitos.',
      });
    }
  });

const METHOD_LABEL: Record<DepositMethod, string> = {
  TRANSFERENCIA: 'Transferencia bancaria / SPEI',
  VENTANILLA: 'Depósito en ventanilla',
};

export async function updateDepositAccount(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.id);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  const parsed = depositSchema.parse(req.body);
  const before = client.depositAccount ?? null;

  const updated = await updateDepositAccountFields(client.id, {
    depositMethod: parsed.depositMethod,
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
  const datoTxt =
    parsed.depositMethod === 'TRANSFERENCIA'
      ? `CLABE ${maskClabe(next.clabe)}`
      : `Cuenta ${next.accountNumber}`;

  const audit = await record({
    actor: req.staff!,
    action: before ? 'DEPOSIT_ACCOUNT_UPDATE' : 'DEPOSIT_ACCOUNT_ASSIGN',
    targetUserId: client.id,
    description:
      `${req.staff!.name} ${verbo} la cuenta de depósito (${METHOD_LABEL[parsed.depositMethod]}) ` +
      `de ${client.displayName}: ${next.bank} · ${datoTxt} · Ref. ${next.reference}${montoTxt}`,
    before,
    after: next,
    ip: clientIp(req),
  });

  res.json({ data: { depositAccount: next, audit } });
}

function maskClabe(clabe: string): string {
  return clabe ? `****${clabe.slice(-4)}` : '—';
}
