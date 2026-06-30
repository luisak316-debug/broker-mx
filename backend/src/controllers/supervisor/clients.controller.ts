import type { Request, Response } from 'express';
import { listClients } from '../../repositories/client.repository';
import { findStaffById } from '../../repositories/staff.repository';

/** Resumen de clientes con inversión — solo lectura para supervisores. */
export async function listClientsSummary(req: Request, res: Response): Promise<void> {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : undefined;
  const clients = await listClients({ q: q || undefined });

  const items = await Promise.all(
    clients.map(async (c) => ({
      id: c.id,
      displayName: c.displayName,
      email: c.email,
      phone: c.phone,
      totalInvestedMxn: c.totalInvestedMxn,
      cashMxn: c.cashMxn,
      advisorName: c.advisorId ? (await findStaffById(c.advisorId))?.displayName : undefined,
      accountStatus: c.accountStatus,
      createdAt: c.createdAt,
    })),
  );

  res.json({ data: items, meta: { total: items.length } });
}
