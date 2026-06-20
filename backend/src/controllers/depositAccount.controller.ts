import type { Request, Response } from 'express';
import { findClient } from '../data/adminStore';
import { HttpError } from '../middleware/errorHandler';

/**
 * Lectura (vista del cliente inversionista) de la cuenta de depósito que su
 * asesor le asignó desde el backoffice. Devuelve únicamente los datos bancarios
 * necesarios para fondear, nunca información sensible de la cuenta interna.
 *
 * En producción este endpoint estaría protegido por la sesión del cliente y
 * resolvería el clientId a partir del token, no del parámetro de ruta.
 */
export function getDepositAccount(req: Request, res: Response): void {
  const client = findClient(req.params.clientId);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  res.json({
    data: {
      clientName: client.displayName,
      assigned: !!client.depositAccount,
      account: client.depositAccount ?? null,
    },
  });
}
