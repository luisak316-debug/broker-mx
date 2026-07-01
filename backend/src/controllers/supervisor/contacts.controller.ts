import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  createAdvisorContact,
  createAdvisorContactsBulk,
  deleteAdvisorContact,
  listAdvisorContacts,
} from '../../repositories/advisorContact.repository';
import { findStaffById, listAdvisorsByManagerTeam, listStaffByRole } from '../../repositories/staff.repository';
import { distributeContacts, parseBulkContacts } from '../../lib/parseBulkContacts';
import { record } from '../../services/audit.service';
import { clientIp } from '../../middleware/auth';
import { HttpError } from '../../middleware/errorHandler';

const contactSchema = z.object({
  advisorId: z.string().min(1),
  clientName: z.string().trim().min(2, 'Nombre del cliente requerido.'),
  phone: z.string().trim().min(10, 'Teléfono de 10 dígitos.'),
  email: z.string().email('Correo inválido.').or(z.literal('')).optional(),
  description: z.string().trim().max(4000).optional(),
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

const bulkSchema = z.object({
  rawText: z.string().min(20, 'Pega la lista de contactos.'),
  assignedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function previewBulkContacts(req: Request, res: Response): Promise<void> {
  const { rawText } = bulkSchema.parse(req.body);
  const { contacts, skippedLines } = parseBulkContacts(rawText);
  const advisors = await listStaffByRole('ADVISOR');

  const perAdvisor =
    advisors.length > 0
      ? contacts.map((_, i) => {
          const base = Math.floor(contacts.length / advisors.length);
          const extra = contacts.length % advisors.length;
          let idx = 0;
          for (let a = 0; a < advisors.length; a++) {
            const count = base + (a < extra ? 1 : 0);
            if (i < idx + count) return advisors[a].displayName;
            idx += count;
          }
          return '';
        })
      : [];

  res.json({
    data: {
      total: contacts.length,
      skipped: skippedLines.length,
      skippedLines: skippedLines.slice(0, 5),
      advisors: advisors.length,
      contacts: contacts.slice(0, 5),
      distribution: advisors.map((a, i) => {
        const base = Math.floor(contacts.length / advisors.length);
        const extra = contacts.length % advisors.length;
        const count = base + (i < extra ? 1 : 0);
        return { advisorId: a.id, advisorName: a.displayName, count };
      }),
      sampleAdvisor: perAdvisor[0],
    },
  });
}

export async function bulkAssignContacts(req: Request, res: Response): Promise<void> {
  const body = bulkSchema.parse(req.body);
  const advisors = await listStaffByRole('ADVISOR');
  if (advisors.length === 0) {
    throw new HttpError(400, 'No hay asesores activos. Agrega asesores primero.');
  }

  const { contacts, skippedLines } = parseBulkContacts(body.rawText);
  if (contacts.length === 0) {
    throw new HttpError(400, 'No se detectaron contactos válidos. Revisa el formato.');
  }

  const assignedDate = body.assignedDate
    ? new Date(`${body.assignedDate}T12:00:00.000Z`)
    : new Date();

  const distributed = distributeContacts(
    contacts,
    advisors.map((a) => a.id),
  );

  const rows = await createAdvisorContactsBulk(
    distributed.map((c) => ({
      advisorId: c.advisorId,
      assignedById: req.staff!.sub,
      clientName: c.clientName,
      phone: c.phone,
      email: c.email,
      description: c.description,
      assignedDate,
    })),
  );

  const byAdvisor = advisors.map((a) => ({
    advisorId: a.id,
    advisorName: a.displayName,
    count: rows.filter((r) => r.advisorId === a.id).length,
  }));

  await record({
    actor: req.staff!,
    action: 'CONTACT_BULK_ASSIGN',
    description: `Asignación masiva: ${rows.length} contactos repartidos entre ${advisors.length} asesores.`,
    ip: clientIp(req),
  });

  res.status(201).json({
    data: {
      saved: rows.length,
      skipped: skippedLines.length,
      distribution: byAdvisor,
      assignedDate: assignedDate.toISOString().slice(0, 10),
    },
  });
}

const managerBulkSchema = z.object({
  assignedDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  teams: z
    .array(
      z.object({
        team: z.number().int().min(1).max(4),
        rawText: z.string(),
      }),
    )
    .min(1),
});

export async function bulkAssignContactsToManagers(req: Request, res: Response): Promise<void> {
  const body = managerBulkSchema.parse(req.body);
  const assignedDate = body.assignedDate
    ? new Date(`${body.assignedDate}T12:00:00.000Z`)
    : new Date();

  let totalSaved = 0;
  let totalSkipped = 0;
  const teamResults: Array<{
    team: number;
    saved: number;
    skipped: number;
    advisorCount: number;
    distribution: Array<{ advisorId: string; advisorName: string; count: number }>;
    warning?: string;
  }> = [];

  const allDistributed: Array<{
    advisorId: string;
    assignedById: string;
    clientName: string;
    phone: string;
    email: string;
    description: string;
    assignedDate: Date;
  }> = [];

  for (const entry of body.teams) {
    const raw = entry.rawText.trim();
    if (!raw) continue;

    const { contacts, skippedLines } = parseBulkContacts(raw);
    totalSkipped += skippedLines.length;

    const advisors = await listAdvisorsByManagerTeam(entry.team);
    if (advisors.length === 0) {
      teamResults.push({
        team: entry.team,
        saved: 0,
        skipped: skippedLines.length,
        advisorCount: 0,
        distribution: [],
        warning: `Equipo ${entry.team} no tiene asesores. Asigna asesores al equipo en la sección Asesores.`,
      });
      continue;
    }

    if (contacts.length === 0) {
      teamResults.push({
        team: entry.team,
        saved: 0,
        skipped: skippedLines.length,
        advisorCount: advisors.length,
        distribution: [],
        warning: 'No se detectaron contactos válidos en este equipo.',
      });
      continue;
    }

    const distributed = distributeContacts(
      contacts,
      advisors.map((a) => a.id),
    );

    for (const c of distributed) {
      allDistributed.push({
        advisorId: c.advisorId,
        assignedById: req.staff!.sub,
        clientName: c.clientName,
        phone: c.phone,
        email: c.email,
        description: c.description,
        assignedDate,
      });
    }

    const byAdvisor = advisors.map((a) => ({
      advisorId: a.id,
      advisorName: a.displayName,
      count: distributed.filter((d) => d.advisorId === a.id).length,
    }));

    teamResults.push({
      team: entry.team,
      saved: contacts.length,
      skipped: skippedLines.length,
      advisorCount: advisors.length,
      distribution: byAdvisor,
    });
    totalSaved += contacts.length;
  }

  if (allDistributed.length === 0) {
    throw new HttpError(
      400,
      teamResults.some((t) => t.warning)
        ? 'Revisa las listas por equipo. Algunos equipos no tienen asesores o contactos válidos.'
        : 'No hay contactos para asignar.',
    );
  }

  await createAdvisorContactsBulk(allDistributed);

  await record({
    actor: req.staff!,
    action: 'CONTACT_BULK_ASSIGN',
    description: `Asignación por gerentes: ${totalSaved} contactos en ${teamResults.filter((t) => t.saved > 0).length} equipo(s).`,
    ip: clientIp(req),
  });

  res.status(201).json({
    data: {
      saved: totalSaved,
      skipped: totalSkipped,
      assignedDate: assignedDate.toISOString().slice(0, 10),
      teams: teamResults,
    },
  });
}
