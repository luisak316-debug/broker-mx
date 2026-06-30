import type { Request, Response } from 'express';
import { findClient } from '../repositories/client.repository';
import { HttpError } from '../middleware/errorHandler';

export async function getDepositAccount(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.clientId);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  res.json({
    data: {
      clientName: client.displayName,
      assigned: !!client.depositAccount,
      account: client.depositAccount ?? null,
    },
  });
}
