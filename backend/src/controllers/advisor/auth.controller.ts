import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  findStaffById,
  findStaffByLoginAccess,
  normalizeStaffDisplay,
  touchStaffLogin,
} from '../../repositories/staff.repository';
import { getManagerTeamDisplayName } from '../../repositories/managerTeam.repository';
import { signToken, verifyPassword } from '../../services/security.service';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';
import { advisorPublicAccess } from '../../lib/advisorAccess';

const loginSchema = z
  .object({
    access: z.string().trim().min(1).optional(),
    email: z.string().trim().min(1).optional(),
    password: z.string().min(1),
  })
  .refine((body) => Boolean(body.access || body.email), {
    message: 'Acceso requerido.',
    path: ['access'],
  });

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.parse(req.body);
  const access = (parsed.access ?? parsed.email ?? '').trim();
  const { password } = parsed;
  const staff = await findStaffByLoginAccess(access);
  if (!staff || !staff.active || !verifyPassword(password, staff.passwordHash)) {
    throw new HttpError(401, 'Acceso o contraseña incorrectos.');
  }
  if (staff.role !== 'ADVISOR') {
    throw new HttpError(403, 'Acceso reservado para asesores.');
  }

  normalizeStaffDisplay(staff);
  await touchStaffLogin(staff.id);
  const managerTeamName = await getManagerTeamDisplayName(staff.managerTeam);
  const token = signToken({
    sub: staff.id,
    role: staff.role,
    email: staff.email,
    name: staff.displayName,
  });

  await record({
    actor: { sub: staff.id, role: staff.role, email: staff.email, name: staff.displayName, exp: 0 },
    action: 'LOGIN',
    description: `${staff.displayName} (asesor) inició sesión en portal de asesores.`,
    ip: clientIp(req),
  });

  res.json({
    data: {
      token,
      staff: {
        id: staff.id,
        access: advisorPublicAccess(staff),
        displayName: staff.displayName,
        role: staff.role,
        managerTeam: staff.managerTeam ?? null,
        managerTeamName,
      },
    },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const staff = await findStaffById(req.staff!.sub);
  if (!staff) throw new HttpError(404, 'Personal no encontrado.');
  if (staff.role !== 'ADVISOR') {
    throw new HttpError(403, 'Acceso reservado para asesores.');
  }
  normalizeStaffDisplay(staff);
  const managerTeamName = await getManagerTeamDisplayName(staff.managerTeam);
  res.json({
    data: {
      id: staff.id,
      access: advisorPublicAccess(staff),
      displayName: staff.displayName,
      role: staff.role,
      managerTeam: staff.managerTeam ?? null,
      managerTeamName,
      lastLoginAt: staff.lastLoginAt,
    },
  });
}
