import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  addManagerTeam,
  ensureManagerStaffForTeam,
  listActiveManagerTeams,
  removeManagerTeam,
  renameManagerTeams,
} from '../../repositories/managerTeam.repository';
import { hashPassword } from '../../services/security.service';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';

function mapTeam(t: Awaited<ReturnType<typeof listActiveManagerTeams>>[number]) {
  return {
    team: t.id,
    displayName: t.displayName,
    managerId: t.managerId,
    advisorCount: t.advisorCount,
  };
}

export async function listManagers(_req: Request, res: Response): Promise<void> {
  const teams = await listActiveManagerTeams();
  res.json({ data: teams.map(mapTeam) });
}

const renameSchema = z.object({
  teams: z
    .array(
      z.object({
        id: z.number().int().positive(),
        displayName: z.string().trim().min(1, 'Nombre requerido.').max(80),
      }),
    )
    .min(1),
});

export async function renameManagers(req: Request, res: Response): Promise<void> {
  const body = renameSchema.parse(req.body);
  try {
    const teams = await renameManagerTeams(body.teams);
    await record({
      actor: req.staff!,
      action: 'MANAGER_TEAMS_RENAME',
      description: `Supervisor renombró gerencias: ${body.teams.map((t) => t.displayName).join(', ')}.`,
      ip: clientIp(req),
    });
    res.json({ data: teams.map(mapTeam) });
  } catch (err) {
    throw new HttpError(400, err instanceof Error ? err.message : 'No se pudo renombrar.');
  }
}

const addSchema = z.object({
  displayName: z.string().trim().min(1).max(80).optional(),
});

export async function addManager(req: Request, res: Response): Promise<void> {
  const body = addSchema.parse(req.body ?? {});
  try {
    const teams = await addManagerTeam(body.displayName);
    const created = teams[teams.length - 1];
    if (created) {
      await ensureManagerStaffForTeam(created.id, hashPassword('Admin1234'));
    }
    await record({
      actor: req.staff!,
      action: 'MANAGER_TEAM_ADD',
      description: `Supervisor agregó gerencia ${created?.displayName ?? 'nueva'}.`,
      ip: clientIp(req),
    });
    res.status(201).json({ data: teams.map(mapTeam) });
  } catch (err) {
    throw new HttpError(400, err instanceof Error ? err.message : 'No se pudo agregar.');
  }
}

export async function removeManager(req: Request, res: Response): Promise<void> {
  const id = Number(req.params.id);
  if (!Number.isFinite(id) || id < 1) throw new HttpError(400, 'Gerencia inválida.');
  try {
    const teams = await removeManagerTeam(id);
    await record({
      actor: req.staff!,
      action: 'MANAGER_TEAM_REMOVE',
      description: `Supervisor eliminó gerencia ${id}.`,
      ip: clientIp(req),
    });
    res.json({ data: teams.map(mapTeam) });
  } catch (err) {
    throw new HttpError(400, err instanceof Error ? err.message : 'No se pudo eliminar.');
  }
}
