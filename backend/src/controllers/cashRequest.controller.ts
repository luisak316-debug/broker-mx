import type { Request, Response } from 'express';
import { z } from 'zod';
import { createCashRequest } from '../repositories/cashRequest.repository';
import { findClient, getInternalUserId, updateClientBalances } from '../repositories/client.repository';
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
});

/** Retiro inmediato: descuenta saldo y registra la operación (sin aprobación admin). */
export async function requestWithdrawal(req: Request, res: Response): Promise<void> {
  const parsed = withdrawSchema.parse(req.body);
  const { clientId, amountMxn, note, payoutBank, payoutOwnerName } = parsed;

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

  const newCashMxn = round2(client.cashMxn - amountMxn);
  await updateClientBalances(clientId, { cashMxn: newCashMxn });

  const request = await createCashRequest({
    userInternalId: internalId,
    type: 'RETIRO',
    amountMxn: round2(amountMxn),
    method: 'SPEI',
    note,
    payoutBank,
    payoutOwnerName,
    status: 'APROBADA',
  });

  res.status(201).json({
    data: {
      request,
      cashMxn: newCashMxn,
      message: 'Contacta a tu asesor de inversiones.',
    },
  });
}

const depositSchema = z.object({
  clientId: z.string().min(1),
  amountMxn: z.number().positive('El monto debe ser mayor a cero.'),
  note: z.string().max(500).optional(),
  method: z.enum(['SPEI', 'VENTANILLA', 'TARJETA', 'OXXO']).optional(),
});

/** Depósito: el cliente notifica un pago; el asesor lo aprueba y acredita el saldo. */
export async function requestDeposit(req: Request, res: Response): Promise<void> {
  const parsed = depositSchema.parse(req.body);
  const { clientId, amountMxn, note, method } = parsed;

  const client = await findClient(clientId);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');
  if (client.accountStatus !== 'ACTIVA') {
    throw new HttpError(403, 'Tu cuenta no puede recibir depósitos en este momento.');
  }

  const internalId = await getInternalUserId(clientId);
  if (!internalId) throw new HttpError(404, 'Cliente no encontrado.');

  const request = await createCashRequest({
    userInternalId: internalId,
    type: 'DEPOSITO',
    amountMxn: round2(amountMxn),
    method: method ?? 'SPEI',
    note,
    status: 'PENDIENTE',
  });

  res.status(201).json({
    data: {
      request,
      message:
        method === 'TARJETA'
          ? 'Tu asesor te enviará un enlace seguro de pago con tarjeta.'
          : 'Recibimos tu aviso de depósito. Tu asesor lo confirmará y acreditará tu saldo.',
    },
  });
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
