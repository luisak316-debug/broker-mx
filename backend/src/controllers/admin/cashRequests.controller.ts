import type { Request, Response } from 'express';
import { z } from 'zod';
import { cashRequests, findClient } from '../../data/adminStore';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';
import { fmtMxn } from '../../utils/format';

export function listCashRequests(req: Request, res: Response): void {
  const status = req.query.status as string | undefined;
  let items = cashRequests;
  if (status) items = items.filter((r) => r.status === status);
  res.json({
    data: [...items].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)),
    meta: { pendientes: cashRequests.filter((r) => r.status === 'PENDIENTE').length },
  });
}

const reviewSchema = z.object({
  status: z.enum(['APROBADA', 'RECHAZADA', 'PENDIENTE']),
  note: z.string().optional(),
});

/** Aprobar, rechazar o marcar como pendiente una solicitud de depósito/retiro. */
export function reviewCashRequest(req: Request, res: Response): void {
  const request = cashRequests.find((r) => r.id === req.params.id);
  if (!request) throw new HttpError(404, 'Solicitud no encontrada.');

  const { status, note } = reviewSchema.parse(req.body);
  const client = findClient(request.userId);
  const before = { status: request.status };

  // Al aprobar, impacta el saldo del cliente (depósito suma, retiro resta).
  if (status === 'APROBADA' && request.status !== 'APROBADA' && client) {
    if (request.type === 'DEPOSITO') {
      client.cashMxn = round2(client.cashMxn + request.amountMxn);
    } else {
      if (request.amountMxn > client.cashMxn) {
        throw new HttpError(400, 'Saldo insuficiente para aprobar el retiro.');
      }
      client.cashMxn = round2(client.cashMxn - request.amountMxn);
    }
  }

  request.status = status;
  request.note = note;
  request.reviewedById = req.staff!.sub;
  request.reviewedByName = req.staff!.name;
  request.reviewedAt = new Date().toISOString();

  const accion =
    status === 'APROBADA' ? 'aprobó' : status === 'RECHAZADA' ? 'rechazó' : 'marcó como pendiente';
  const audit = record({
    actor: req.staff!,
    action: `CASH_REQUEST_${status}`,
    targetUserId: request.userId,
    description: `${req.staff!.name} ${accion} la solicitud de ${request.type.toLowerCase()} por ${fmtMxn(request.amountMxn)} de ${request.clientName}.${note ? ` Nota: ${note}` : ''}`,
    before,
    after: { status: request.status },
    ip: clientIp(req),
  });

  res.json({ data: { request, audit } });
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
