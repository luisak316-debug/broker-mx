import type { Request, Response } from 'express';
import { list } from '../../services/audit.service';

/** Bitácora de auditoría: quién hizo qué, cuándo y sobre qué cliente. */
export function listAudit(req: Request, res: Response): void {
  const staffId = req.query.staffId as string | undefined;
  const targetUserId = req.query.clientId as string | undefined;
  res.json({ data: list({ staffId, targetUserId }) });
}
