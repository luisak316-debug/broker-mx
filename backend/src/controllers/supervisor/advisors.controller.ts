import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createOrReactivateAdvisor,
  deactivateStaff,
  listAdvisorPhoneHistory,
  listStaffByRole,
  updateAdvisorAccess,
  updateAdvisorComputerId,
  updateAdvisorDates,
  updateAdvisorPhone,
} from '../../repositories/staff.repository';
import { findManagerTeamById } from '../../repositories/staff.repository';
import { hashPassword } from '../../services/security.service';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';
import { advisorPublicAccess, normalizeAdvisorLoginAccess, titleCaseName } from '../../lib/advisorAccess';

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
  access: z
    .string()
    .trim()
    .transform((v) => normalizeAdvisorLoginAccess(v)),
  displayName: z.string().trim().min(2, 'Nombre requerido.'),
  managerTeam: z.number().int().min(1).optional().nullable(),
  phone: z.preprocess(
    (val) => (val === '' || val === null || val === undefined ? null : val),
    phoneSchema.nullable().optional(),
  ),
  hireDate: dateSchema,
  computerId: z.preprocess(
    (val) => {
      if (val === '' || val === null || val === undefined) return null;
      const s = String(val).trim();
      if (!s) return null;
      return s;
    },
    z
      .string()
      .max(32)
      .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, 'Usa un ID de laptop (ej. LAP-001), no un correo.')
      .nullable()
      .optional(),
  ),
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

const passwordSchema = z
  .string()
  .min(8, 'Mínimo 8 caracteres.')
  .regex(/[A-Za-z]/, 'Debe incluir letras.')
  .regex(/\d/, 'Debe incluir números.');

const updateAccessSchema = z
  .object({
    access: z
      .string()
      .trim()
      .transform((v) => normalizeAdvisorLoginAccess(v))
      .optional(),
    displayName: z.string().trim().min(2, 'Nombre requerido.').optional(),
    password: passwordSchema.optional(),
  })
  .refine((v) => v.access || v.displayName || v.password, {
    message: 'Indica nombre, acceso o contraseña para actualizar.',
  });

function mapAdvisor(a: Awaited<ReturnType<typeof listStaffByRole>>[number]) {
  return {
    id: a.id,
    access: advisorPublicAccess(a),
    displayName: a.displayName,
    managerTeam: a.managerTeam ?? null,
    phone: a.phone ?? null,
    computerId: a.computerId ?? null,
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

  if (body.managerTeam != null) {
    const team = await findManagerTeamById(body.managerTeam);
    if (!team) throw new HttpError(400, 'Gerencia no válida.');
  }

  let advisor;
  try {
    advisor = await createOrReactivateAdvisor({
      loginAccess: body.access,
      displayName: titleCaseName(body.displayName),
      passwordHash: hashPassword(body.password),
      managerTeam: body.managerTeam ?? null,
      phone: body.phone ?? null,
      computerId: body.computerId ?? null,
      hireDate: body.hireDate ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'No se pudo crear el asesor.';
    throw new HttpError(msg.includes('acceso') || msg.includes('PC') ? 409 : 400, msg);
  }

  await record({
    actor: req.staff!,
    action: 'ADVISOR_CREATE',
    description: `Supervisor creó asesor ${advisor.displayName} (acceso ${advisorPublicAccess(advisor)}).`,
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

export async function updateAdvisorAccessHandler(req: Request, res: Response): Promise<void> {
  const body = updateAccessSchema.parse(req.body);
  const advisors = await listStaffByRole('ADVISOR');
  if (!advisors.some((a) => a.id === req.params.id)) {
    throw new HttpError(404, 'Asesor no encontrado.');
  }

  try {
    const advisor = await updateAdvisorAccess(req.params.id, {
      loginAccess: body.access,
      displayName: body.displayName ? titleCaseName(body.displayName) : undefined,
      passwordHash: body.password ? hashPassword(body.password) : undefined,
    });
    await record({
      actor: req.staff!,
      action: 'ADVISOR_ACCESS_UPDATE',
      description: `Supervisor actualizó acceso del asesor ${advisor.displayName} (acceso ${advisorPublicAccess(advisor)}).`,
      ip: clientIp(req),
    });
    res.json({ data: mapAdvisor(advisor) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'No se pudo actualizar.';
    throw new HttpError(msg.includes('acceso') ? 409 : 400, msg);
  }
}

const updateComputerSchema = z.object({
  computerId: z
    .string()
    .trim()
    .max(32)
    .regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, 'Identificador de PC inválido.')
    .nullable()
    .optional(),
});

export async function updateAdvisorComputerIdHandler(req: Request, res: Response): Promise<void> {
  const body = updateComputerSchema.parse(req.body);
  const advisors = await listStaffByRole('ADVISOR');
  if (!advisors.some((a) => a.id === req.params.id)) {
    throw new HttpError(404, 'Asesor no encontrado.');
  }

  try {
    const advisor = await updateAdvisorComputerId(
      req.params.id,
      body.computerId?.trim() ? body.computerId.trim() : null,
    );
    await record({
      actor: req.staff!,
      action: 'ADVISOR_COMPUTER_ID_UPDATE',
      description: `Supervisor asignó PC ${advisor.computerId ?? '—'} a ${advisor.displayName}.`,
      ip: clientIp(req),
    });
    res.json({ data: mapAdvisor(advisor) });
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'No se pudo actualizar.';
    throw new HttpError(msg.includes('en uso') || msg.includes('asignado') ? 409 : 400, msg);
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
