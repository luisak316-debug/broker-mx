import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  findClient,
  listClients,
  updateAccountStatus,
} from '../../repositories/client.repository';
import {
  findStaffById,
  resolveActiveAdvisorDisplayName,
} from '../../repositories/staff.repository';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';

export async function listClientsHandler(req: Request, res: Response): Promise<void> {
  const q = String(req.query.q ?? '').trim();
  const status = req.query.status as string | undefined;
  const kyc = req.query.kyc as string | undefined;

  const clients = await listClients({
    q: q || undefined,
    status,
    kyc,
  });

  const items = await Promise.all(
    clients.map(async (c) => ({
      id: c.id,
      displayName: c.displayName,
      email: c.email,
      phone: c.phone,
      plainPassword: c.plainPassword,
      kycStatus: c.kycStatus,
      accountStatus: c.accountStatus,
      riskProfile: c.riskProfile,
      cashMxn: c.cashMxn,
      totalInvestedMxn: c.totalInvestedMxn,
      advisorName: await resolveActiveAdvisorDisplayName(c.advisorId),
      createdAt: c.createdAt,
      lastWithdrawalRequestAt: c.lastWithdrawalRequestAt,
      profilePhotoUrl: c.profilePhotoUrl,
    })),
  );

  res.json({ data: items, meta: { total: items.length } });
}

export async function getClient(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.id);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');
  const advisor = client.advisorId ? await findStaffById(client.advisorId) : undefined;
  const advisorActive = advisor?.active && advisor.role === 'ADVISOR';
  res.json({
    data: {
      ...client,
      advisorName: advisorActive ? advisor.displayName : undefined,
      advisorEmail: advisorActive ? advisor.email : undefined,
    },
  });
}

const accessSchema = z.object({
  accountStatus: z.enum(['ACTIVA', 'SUSPENDIDA', 'BLOQUEADA', 'CERRADA']),
  reason: z.string().min(5, 'Indica la razón del cambio (mínimo 5 caracteres).'),
});

/** Revocar o restaurar acceso — solo desde administración. */
export async function updateClientAccess(req: Request, res: Response): Promise<void> {
  const client = await findClient(req.params.id);
  if (!client) throw new HttpError(404, 'Cliente no encontrado.');

  const { accountStatus, reason } = accessSchema.parse(req.body);
  const before = { accountStatus: client.accountStatus };
  const updated = await updateAccountStatus(client.id, accountStatus);
  if (!updated) throw new HttpError(404, 'Cliente no encontrado.');

  await record({
    actor: req.staff!,
    action: 'ACCOUNT_STATUS_UPDATE',
    targetUserId: client.id,
    description: `${req.staff!.name} cambió el estado de ${client.displayName} a ${accountStatus}. Razón: ${reason}`,
    before,
    after: { accountStatus },
    ip: clientIp(req),
  });

  res.json({ data: updated });
}
