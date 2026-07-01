import type { Request, Response } from 'express';
import { listManagerTeams } from '../../repositories/staff.repository';

export async function listManagers(_req: Request, res: Response): Promise<void> {
  const teams = await listManagerTeams();
  res.json({ data: teams });
}
