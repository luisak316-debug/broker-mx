import type { Request, Response } from 'express';
import { list } from '../../services/audit.service';

export async function listAudit(req: Request, res: Response): Promise<void> {
  const staffId = req.query.staffId as string | undefined;
  const targetUserId = req.query.clientId as string | undefined;
  const data = await list({ staffId, targetUserId });
  res.json({ data });
}
