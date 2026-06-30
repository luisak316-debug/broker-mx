import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  findStaffByEmail,
  findStaffById,
  normalizeStaffDisplay,
  touchStaffLogin,
} from '../../repositories/staff.repository';
import { signToken, verifyPassword } from '../../services/security.service';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = loginSchema.parse(req.body);
  const staff = await findStaffByEmail(email);
  if (!staff || !staff.active || !verifyPassword(password, staff.passwordHash)) {
    throw new HttpError(401, 'Credenciales inválidas.');
  }
  if (staff.role !== 'SUPERVISOR' && staff.role !== 'ADMIN') {
    throw new HttpError(403, 'Acceso reservado para supervisores.');
  }

  normalizeStaffDisplay(staff);
  await touchStaffLogin(staff.id);
  const token = signToken({
    sub: staff.id,
    role: staff.role,
    email: staff.email,
    name: staff.displayName,
  });

  await record({
    actor: { sub: staff.id, role: staff.role, email: staff.email, name: staff.displayName, exp: 0 },
    action: 'LOGIN',
    description: `${staff.displayName} (${staff.role}) inició sesión en supervisores.`,
    ip: clientIp(req),
  });

  res.json({
    data: {
      token,
      staff: {
        id: staff.id,
        email: staff.email,
        displayName: staff.displayName,
        role: staff.role,
      },
    },
  });
}

export async function me(req: Request, res: Response): Promise<void> {
  const staff = await findStaffById(req.staff!.sub);
  if (!staff) throw new HttpError(404, 'Personal no encontrado.');
  if (staff.role !== 'SUPERVISOR' && staff.role !== 'ADMIN') {
    throw new HttpError(403, 'Acceso reservado para supervisores.');
  }
  normalizeStaffDisplay(staff);
  res.json({
    data: {
      id: staff.id,
      email: staff.email,
      displayName: staff.displayName,
      role: staff.role,
      lastLoginAt: staff.lastLoginAt,
    },
  });
}
