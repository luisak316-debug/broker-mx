import type { Request, Response } from 'express';
import { z } from 'zod';
import { findStaffByEmail, findStaffById, normalizeStaffDisplay } from '../../data/adminStore';
import { signToken, verifyPassword } from '../../services/security.service';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function login(req: Request, res: Response): void {
  const { email, password } = loginSchema.parse(req.body);
  const staff = findStaffByEmail(email);
  // Mensaje genérico para no revelar si el correo existe (anti-enumeración).
  if (!staff || !staff.active || !verifyPassword(password, staff.passwordHash)) {
    throw new HttpError(401, 'Credenciales inválidas.');
  }

  normalizeStaffDisplay(staff);
  staff.lastLoginAt = new Date().toISOString();
  const token = signToken({
    sub: staff.id,
    role: staff.role,
    email: staff.email,
    name: staff.displayName,
  });

  record({
    actor: { sub: staff.id, role: staff.role, email: staff.email, name: staff.displayName, exp: 0 },
    action: 'LOGIN',
    description: `${staff.displayName} (${staff.role}) inició sesión en el backoffice.`,
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

export function me(req: Request, res: Response): void {
  const staff = findStaffById(req.staff!.sub);
  if (!staff) throw new HttpError(404, 'Personal no encontrado.');
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
