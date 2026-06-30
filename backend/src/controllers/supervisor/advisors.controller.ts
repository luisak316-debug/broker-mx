import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createStaff,
  deactivateStaff,
  findStaffByEmail,
  listStaffByRole,
} from '../../repositories/staff.repository';
import { hashPassword } from '../../services/security.service';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';

const createSchema = z.object({
  email: z.string().email('Correo inválido.'),
  displayName: z.string().trim().min(2, 'Nombre requerido.'),
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres.')
    .regex(/[A-Za-z]/, 'Debe incluir letras.')
    .regex(/\d/, 'Debe incluir números.'),
});

export async function listAdvisors(_req: Request, res: Response): Promise<void> {
  const advisors = await listStaffByRole('ADVISOR');
  res.json({
    data: advisors.map((a) => ({
      id: a.id,
      email: a.email,
      displayName: a.displayName,
      lastLoginAt: a.lastLoginAt,
      createdAt: a.createdAt,
    })),
  });
}

export async function createAdvisor(req: Request, res: Response): Promise<void> {
  const body = createSchema.parse(req.body);
  const existing = await findStaffByEmail(body.email);
  if (existing) throw new HttpError(409, 'Ya existe personal con ese correo.');

  const advisor = await createStaff({
    email: body.email,
    displayName: body.displayName,
    role: 'ADVISOR',
    passwordHash: hashPassword(body.password),
  });

  await record({
    actor: req.staff!,
    action: 'ADVISOR_CREATE',
    description: `Supervisor creó asesor ${advisor.displayName} (${advisor.email}).`,
    ip: clientIp(req),
  });

  res.status(201).json({
    data: {
      id: advisor.id,
      email: advisor.email,
      displayName: advisor.displayName,
    },
  });
}

export async function removeAdvisor(req: Request, res: Response): Promise<void> {
  const advisors = await listStaffByRole('ADVISOR');
  const target = advisors.find((a) => a.id === req.params.id);
  if (!target) throw new HttpError(404, 'Asesor no encontrado.');

  await deactivateStaff(target.id);

  await record({
    actor: req.staff!,
    action: 'ADVISOR_DEACTIVATE',
    description: `Supervisor desactivó asesor ${target.displayName}.`,
    ip: clientIp(req),
  });

  res.json({ data: { ok: true } });
}
