import type { Request, Response } from 'express';
import { z } from 'zod';
import { findClient, updateClientBalances } from '../../repositories/client.repository';
import {
  countPendingCashRequests,
  findCashRequest,
  listCashRequests,
  reviewCashRequest,
} from '../../repositories/cashRequest.repository';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';
import { fmtMxn } from '../../utils/format';

export async function listCashRequestsHandler(req: Request, res: Response): Promise<void> {
  const status = req.query.status as string | undefined;
  const items = await listCashRequests(status);
  const pendientes = await countPendingCashRequests();
  res.json({ data: items, meta: { pendientes } });
}

const reviewSchema = z.object({
  status: z.enum(['APROBADA', 'RECHAZADA', 'PENDIENTE']),
  note: z.string().optional(),
});

export async function reviewCashRequestHandler(req: Request, res: Response): Promise<void> {
  const request = await findCashRequest(req.params.id);
  if (!request) throw new HttpError(404, 'Solicitud no encontrada.');

  const { status, note } = reviewSchema.parse(req.body);
  const client = await findClient(request.user.clientCode);
  const before = { status: request.status };

  if (status === 'APROBADA' && request.status !== 'APROBADA' && client) {
    const amount = Number(request.amountMxn);
    if (request.type === 'DEPOSITO') {
      await updateClientBalances(client.id, { cashMxn: round2(client.cashMxn + amount) });
    } else {
      if (amount > client.cashMxn) {
        throw new HttpError(400, 'Saldo insuficiente para aprobar el retiro.');
      }
      await updateClientBalances(client.id, { cashMxn: round2(client.cashMxn - amount) });
    }
  }

  const updated = await reviewCashRequest(req.params.id, {
    status,
    note,
    reviewedById: req.staff!.sub,
    reviewedByName: req.staff!.name,
  });
  if (!updated) throw new HttpError(404, 'Solicitud no encontrada.');

  const accion =
    status === 'APROBADA' ? 'aprobó' : status === 'RECHAZADA' ? 'rechazó' : 'marcó como pendiente';

  const audit = await record({
    actor: req.staff!,
    action: `CASH_REQUEST_${status}`,
    targetUserId: client?.id,
    description: `${req.staff!.name} ${accion} la solicitud de ${updated.type.toLowerCase()} por ${fmtMxn(updated.amountMxn)} de ${updated.clientName}.${note ? ` Nota: ${note}` : ''}`,
    before,
    after: { status: updated.status },
    ip: clientIp(req),
  });

  res.json({ data: { request: updated, audit } });
}

function round2(v: number): number {
  return Math.round(v * 100) / 100;
}
