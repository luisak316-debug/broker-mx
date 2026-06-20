import type { Request, Response } from 'express';
import { clients, findClient, findStaffById } from '../../data/adminStore';
import { HttpError } from '../../middleware/errorHandler';

/** Vista general en tabla con buscador y filtros. */
export function listClients(req: Request, res: Response): void {
  const q = String(req.query.q ?? '').toLowerCase().trim();
  const status = req.query.status as string | undefined; // accountStatus
  const kyc = req.query.kyc as string | undefined;

  let items = clients.map((c) => ({
    id: c.id,
    displayName: c.displayName,
    email: c.email,
    phone: c.phone,
    kycStatus: c.kycStatus,
    accountStatus: c.accountStatus,
    riskProfile: c.riskProfile,
    cashMxn: c.cashMxn,
    totalInvestedMxn: c.totalInvestedMxn,
    advisorName: findStaffById(c.advisorId ?? '')?.displayName,
    createdAt: c.createdAt,
  }));

  if (q) {
    items = items.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }
  if (status) items = items.filter((c) => c.accountStatus === status);
  if (kyc) items = items.filter((c) => c.kycStatus === kyc);

  res.json({ data: items, meta: { total: items.length } });
}

/** Ficha de perfil individual. */
export function getClient(req: Request, res: Response): void {
  const client = findClient(req.params.id);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');
  const advisor = findStaffById(client.advisorId ?? '');
  res.json({
    data: {
      ...client,
      advisorName: advisor?.displayName,
      advisorEmail: advisor?.email,
    },
  });
}
