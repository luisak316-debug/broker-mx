import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createStaff,
  deactivateStaff,
  findStaffByEmail,
  listAdvisorPhoneHistory,
  listStaffByRole,
  updateAdvisorDates,
  updateAdvisorPhone,
} from '../../repositories/staff.repository';
import { hashPassword } from '../../services/security.service';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';

const phoneSchema = z
  .string()
  .trim()
  .transform((v) => v.replace(/\D/g, '').slice(-10))
  .refine((v) => /^\d{10}$/.test(v), 'Teléfono de 10 dígitos.');

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .nullable()
  .optional();

const createSchema = z.object({
  email: z.string().email('Correo inválido.'),
  displayName: z.string().trim().min(2, 'Nombre requerido.'),
  managerTeam: z.number().int().min(1).max(4).optional().nullable(),
  phone: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : val),
    phoneSchema.nullable().optional(),
  ),
  hireDate: dateSchema,
  password: z
    .string()
    .min(8, 'Mínimo 8 caracteres.')
    .regex(/[A-Za-z]/, 'Debe incluir letras.')
    .regex(/\d/, 'Debe incluir números.'),
});

const updatePhoneSchema = z.object({
  phone: phoneSchema,
});

const updateDatesSchema = z.object({
  hireDate: dateSchema,
  inactiveDate: dateSchema,
});

function mapAdvisor(a: Awaited<ReturnType<typeof listStaffByRole>>[number]) {
  return {
    id: a.id,
    email: a.email,
    displayName: a.displayName,
    managerTeam: a.managerTeam ?? null,
    phone: a.phone ?? null,
    hireDate: a.hireDate ?? null,
    inactiveDate: a.inactiveDate ?? null,
    lastLoginAt: a.lastLoginAt,
    createdAt: a.createdAt,
  };
}

export async function listAdvisors(_req: Request, res: Response): Promise<void> {
  const advisors = await listStaffByRole('ADVISOR');
  res.json({ data: advisors.map(mapAdvisor) });
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
    managerTeam: body.managerTeam ?? null,
    phone: body.phone ?? null,
    hireDate: body.hireDate ?? null,
  });

  await record({
    actor: req.staff!,
    action: 'ADVISOR_CREATE',
    description: `Supervisor creó asesor ${advisor.displayName} (${advisor.email}).`,
    ip: clientIp(req),
  });

  res.status(201).json({ data: mapAdvisor(advisor) });
}

export async function updateAdvisorPhoneHandler(req: Request, res: Response): Promise<void> {
  const body = updatePhoneSchema.parse(req.body);
  try {
    const advisor = await updateAdvisorPhone(req.params.id, body.phone, req.staff!.sub);
    await record({
      actor: req.staff!,
      action: 'ADVISOR_PHONE_UPDATE',
      description: `Supervisor actualizó teléfono de ${advisor.displayName} a ${advisor.phone}.`,
      ip: clientIp(req),
    });
    res.json({ data: mapAdvisor(advisor) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'No se pudo actualizar.';
    throw new HttpError(msg.includes('10 dígitos') ? 400 : 404, msg);
  }
}

export async function updateAdvisorDatesHandler(req: Request, res: Response): Promise<void> {
  const body = updateDatesSchema.parse(req.body);
  try {
    const advisor = await updateAdvisorDates(req.params.id, {
      hireDate: body.hireDate,
      inactiveDate: body.inactiveDate,
    });
    await record({
      actor: req.staff!,
      action: 'ADVISOR_DATES_UPDATE',
      description: `Supervisor actualizó fechas de ${advisor.displayName}.`,
      ip: clientIp(req),
    });
    res.json({ data: mapAdvisor(advisor) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'No se pudo actualizar.';
    throw new HttpError(404, msg);
  }
}

export async function listAdvisorPhones(req: Request, res: Response): Promise<void> {
  const advisors = await listStaffByRole('ADVISOR');
  if (!advisors.some((a) => a.id === req.params.id)) {
    throw new HttpError(404, 'Asesor no encontrado.');
  }
  const history = await listAdvisorPhoneHistory(req.params.id);
  res.json({ data: history });
}

export async function removeAdvisor(req: Request, res: Response): Promise<void> {
  const advisors = await listStaffByRole('ADVISOR');
  const target = advisors.find((a) => a.id === req.params.id);
  if (!target) throw new HttpError(404, 'Asesor no encontrado.');

  await deactivateStaff(target.id, target.inactiveDate ?? undefined);

  await record({
    actor: req.staff!,
    action: 'ADVISOR_DEACTIVATE',
    description: `Supervisor desactivó asesor ${target.displayName}.`,
    ip: clientIp(req),
  });

  res.json({ data: { ok: true } });
}
