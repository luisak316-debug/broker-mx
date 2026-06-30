import type { Request, Response } from 'express';
import { z } from 'zod';
import { createCashRequest } from '../repositories/cashRequest.repository';
import { findClient, getInternalUserId } from '../repositories/client.repository';
import { HttpError } from '../middleware/errorHandler';

const withdrawSchema = z.object({
  clientId: z.string().min(1),
  amountMxn: z.number().positive('El monto debe ser mayor a cero.'),
  note: z.string().max(500).optional(),
  payoutBank: z.string().trim().min(2, 'Indica el banco destino.'),
  payoutOwnerName: z
    .string()
    .trim()
    .min(5, 'Indica el nombre completo del titular de la cuenta.'),
  payoutConcept: z.string().trim().min(3, 'Indica el concepto del retiro.'),
});

/** Solicitud de retiro desde la app del cliente (con cuenta destino simulada). */
export async function requestWithdrawal(req: Request, res: Response): Promise<void> {
  const parsed = withdrawSchema.parse(req.body);
  const { clientId, amountMxn, note, payoutBank, payoutOwnerName, payoutConcept } = parsed;

  const client = await findClient(clientId);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');
  if (client.accountStatus !== 'ACTIVA') {
    throw new HttpError(403, 'Tu cuenta no puede solicitar retiros en este momento.');
  }
  if (amountMxn > client.cashMxn) {
    throw new HttpError(400, 'El monto supera tu saldo disponible.');
  }

  const internalId = await getInternalUserId(clientId);
  if (!internalId) throw new HttpError(404, 'Cliente no encontrado.');

  const request = await createCashRequest({
    userInternalId: internalId,
    type: 'RETIRO',
    amountMxn: round2(amountMxn),
    method: 'SPEI',
    note,
    payoutBank,
    payoutOwnerName,
    payoutConcept,
  });

  res.status(201).json({
    data: {
      request,
      message:
        'Solicitud de retiro enviada con los datos bancarios indicados. Tu asesor la revisará pronto.',
    },
  });
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
