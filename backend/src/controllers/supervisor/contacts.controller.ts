import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createAdvisorContact,
  deleteAdvisorContact,
  listAdvisorContacts,
} from '../../repositories/advisorContact.repository';
import { findStaffById } from '../../repositories/staff.repository';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';

const contactSchema = z.object({
  advisorId: z.string().min(1),
  clientName: z.string().trim().min(2, 'Nombre del cliente requerido.'),
  phone: z.string().trim().min(10, 'Teléfono de 10 dígitos.'),
  email: z.string().email('Correo inválido.').or(z.literal('')).optional(),
  description: z.string().trim().max(500).optional(),
  assignedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function listContacts(req: Request, res: Response): Promise<void> {
  const advisorId = typeof req.query.advisorId === 'string' ? req.query.advisorId : undefined;
  const year = req.query.year ? Number(req.query.year) : undefined;
  const month = req.query.month ? Number(req.query.month) : undefined;
  const day = req.query.day ? Number(req.query.day) : undefined;

  const rows = await listAdvisorContacts({
    advisorId,
    assignedById: req.staff!.sub,
    year: Number.isFinite(year) ? year : undefined,
    month: Number.isFinite(month) ? month : undefined,
    day: Number.isFinite(day) ? day : undefined,
  });

  res.json({ data: rows });
}

export async function saveContact(req: Request, res: Response): Promise<void> {
  const body = contactSchema.parse(req.body);
  const advisor = await findStaffById(body.advisorId);
  if (!advisor || advisor.role !== 'ADVISOR' || !advisor.active) {
    throw new HttpError(400, 'Asesor no válido.');
  }

  const phone = body.phone.replace(/\D/g, '').slice(-10);
  if (phone.length !== 10) throw new HttpError(400, 'Teléfono de 10 dígitos.');

  const assignedDate = body.assignedDate ? new Date(`${body.assignedDate}T12:00:00.000Z`) : new Date();

  const row = await createAdvisorContact({
    advisorId: body.advisorId,
    assignedById: req.staff!.sub,
    clientName: body.clientName,
    phone,
    email: body.email ?? '',
    description: body.description ?? '',
    assignedDate,
  });

  await record({
    actor: req.staff!,
    action: 'CONTACT_ASSIGN',
    description: `Contacto ${row.clientName} asignado a ${row.advisorName} (${row.assignedDate}).`,
    ip: clientIp(req),
  });

  res.status(201).json({ data: row });
}

export async function removeContact(req: Request, res: Response): Promise<void> {
  await deleteAdvisorContact(req.params.id);
  res.json({ data: { ok: true } });
}
