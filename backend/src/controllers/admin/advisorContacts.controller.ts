import type { Request, Response } from 'express';
import { listAdvisorContacts } from '../../repositories/advisorContact.repository';
import { listStaffByRole } from '../../repositories/staff.repository';
import { listActiveManagerTeams } from '../../repositories/managerTeam.repository';
import { maskContactPhoneE164 } from '../../lib/contactPhone';
import { HttpError } from '../../middleware/errorHandler';
import type { AdvisorContactRow } from '../../types/admin';

function parseDateQuery(req: Request): { y: number; m: number; d: number; iso: string } {
  const year = req.query.year ? Number(req.query.year) : undefined;
  const month = req.query.month ? Number(req.query.month) : undefined;
  const day = req.query.day ? Number(req.query.day) : undefined;
  const now = new Date();
  const y = Number.isFinite(year) ? year! : now.getUTCFullYear();
  const m = Number.isFinite(month) ? month! : now.getUTCMonth() + 1;
  const d = Number.isFinite(day) ? day! : now.getUTCDate();
  const iso = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  return { y, m, d, iso };
}

function mapAdvisorContactForClient(row: AdvisorContactRow) {
  return {
    id: row.id,
    clientName: row.clientName,
    phone: maskContactPhoneE164(row.phone),
    email: row.email,
    description: row.description,
    assignedDate: row.assignedDate,
    assignedByName: row.assignedByName,
    createdAt: row.createdAt,
  };
}

/** Historial completo de contactos asignados al asesor — agrupable en frontend. */
export async function listMyContactHistory(req: Request, res: Response): Promise<void> {
  const staff = req.staff!;
  if (staff.role !== 'ADVISOR') {
    throw new HttpError(403, 'Esta vista es solo para asesores.');
  }

  const year = req.query.year ? Number(req.query.year) : undefined;
  const from = typeof req.query.from === 'string' ? req.query.from : undefined;
  const to = typeof req.query.to === 'string' ? req.query.to : undefined;

  const rows = await listAdvisorContacts({
    advisorId: staff.sub,
    year: Number.isFinite(year) ? year : undefined,
    fromDate: from,
    toDate: to,
  });

  res.json({
    data: {
      contacts: rows.map(mapAdvisorContactForClient),
      total: rows.length,
    },
  });
}

/** Contactos del día para el asesor logueado — teléfonos enmascarados. */
export async function listMyAssignedContacts(req: Request, res: Response): Promise<void> {
  const staff = req.staff!;
  if (staff.role !== 'ADVISOR') {
    throw new HttpError(403, 'Esta vista es solo para asesores.');
  }

  const { y, m, d } = parseDateQuery(req);

  const rows = await listAdvisorContacts({
    advisorId: staff.sub,
    year: y,
    month: m,
    day: d,
  });

  res.json({
    data: rows.map(mapAdvisorContactForClient),
  });
}

/** Vista admin: repartición de contactos del día por gerencia y asesor. */
export async function listContactsDistribution(req: Request, res: Response): Promise<void> {
  const { y, m, d, iso } = parseDateQuery(req);

  const [contacts, advisors, managerTeams] = await Promise.all([
    listAdvisorContacts({ year: y, month: m, day: d }),
    listStaffByRole('ADVISOR'),
    listActiveManagerTeams(),
  ]);

  const teamNameById = new Map(managerTeams.map((t) => [t.id, t.displayName]));

  const byAdvisorId = new Map<string, typeof contacts>();
  for (const c of contacts) {
    const list = byAdvisorId.get(c.advisorId) ?? [];
    list.push(c);
    byAdvisorId.set(c.advisorId, list);
  }

  type AdvisorBlock = {
    advisorId: string;
    advisorName: string;
    contactCount: number;
    contacts: Array<{
      id: string;
      clientName: string;
      phone: string;
      email: string;
      description: string;
    }>;
  };

  type TeamBlock = {
    team: number | null;
    label: string;
    contactCount: number;
    advisors: AdvisorBlock[];
  };

  const teamMap = new Map<number | null, TeamBlock>();

  function ensureTeam(team: number | null): TeamBlock {
    const existing = teamMap.get(team);
    if (existing) return existing;
    const label = team
      ? (teamNameById.get(team) ?? `Gerencia ${team}`)
      : 'Sin gerencia asignada';
    const block: TeamBlock = { team, label, contactCount: 0, advisors: [] };
    teamMap.set(team, block);
    return block;
  }

  for (const advisor of advisors) {
    const team = advisor.managerTeam ?? null;
    const teamBlock = ensureTeam(team);
    const assigned = byAdvisorId.get(advisor.id) ?? [];
    teamBlock.advisors.push({
      advisorId: advisor.id,
      advisorName: advisor.displayName,
      contactCount: assigned.length,
      contacts: assigned.map((c) => ({
        id: c.id,
        clientName: c.clientName,
        phone: maskContactPhoneE164(c.phone),
        email: c.email,
        description: c.description,
      })),
    });
    teamBlock.contactCount += assigned.length;
  }

  const teams = [...teamMap.values()].sort((a, b) => {
    if (a.team === null) return 1;
    if (b.team === null) return -1;
    return a.team - b.team;
  });

  for (const team of teams) {
    team.advisors.sort((a, b) => a.advisorName.localeCompare(b.advisorName, 'es'));
  }

  res.json({
    data: {
      assignedDate: iso,
      totalContacts: contacts.length,
      advisorCount: advisors.length,
      teams,
    },
  });
}
