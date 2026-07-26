import { isDatabaseEnabled } from '../lib/database';
import { prisma } from '../lib/prisma';
import { managerEmail } from '../config/brand';

export interface ManagerTeamRow {
  id: number;
  displayName: string;
  advisorCount: number;
  managerId?: string;
}

const LEGACY_TEAMS: ManagerTeamRow[] = [1, 2, 3, 4].map((id) => ({
  id,
  displayName: `Gerencia ${id}`,
  advisorCount: 0,
}));

export async function listActiveManagerTeams(): Promise<ManagerTeamRow[]> {
  if (!isDatabaseEnabled()) return LEGACY_TEAMS;

  const teams = await prisma.managerTeam.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: 'asc' }, { id: 'asc' }],
  });

  if (teams.length === 0) return LEGACY_TEAMS;

  const advisorCounts = await Promise.all(
    teams.map((t) =>
      prisma.staff.count({
        where: { role: 'ADVISOR', active: true, managerTeam: t.id },
      }),
    ),
  );

  const managers = await prisma.staff.findMany({
    where: {
      role: 'MANAGER',
      active: true,
      managerTeam: { in: teams.map((t) => t.id) },
    },
  });

  return teams.map((t, i) => ({
    id: t.id,
    displayName: t.displayName,
    advisorCount: advisorCounts[i] ?? 0,
    managerId: managers.find((m) => m.managerTeam === t.id)?.id,
  }));
}

export async function findManagerTeamById(id: number): Promise<{ id: number; displayName: string } | null> {
  if (!isDatabaseEnabled()) {
    const legacy = LEGACY_TEAMS.find((t) => t.id === id);
    return legacy ? { id: legacy.id, displayName: legacy.displayName } : null;
  }
  const row = await prisma.managerTeam.findFirst({ where: { id, active: true } });
  return row ? { id: row.id, displayName: row.displayName } : null;
}

export async function getManagerTeamDisplayName(teamId: number | null | undefined): Promise<string | null> {
  if (teamId == null) return null;
  const team = await findManagerTeamById(teamId);
  return team?.displayName ?? `Gerencia ${teamId}`;
}

export async function ensureManagerTeamRecordsSeeded(): Promise<void> {
  if (!isDatabaseEnabled()) return;

  for (let id = 1; id <= 4; id++) {
    await prisma.managerTeam.upsert({
      where: { id },
      update: {},
      create: { id, displayName: `Gerencia ${id}`, sortOrder: id },
    });
  }
}

export async function renameManagerTeams(
  updates: Array<{ id: number; displayName: string }>,
): Promise<ManagerTeamRow[]> {
  if (!isDatabaseEnabled()) throw new Error('Renombrar gerencias requiere PostgreSQL.');

  for (const item of updates) {
    const name = item.displayName.trim();
    if (!name) throw new Error('El nombre de gerencia no puede estar vacío.');
    const team = await prisma.managerTeam.findFirst({ where: { id: item.id, active: true } });
    if (!team) throw new Error(`Gerencia ${item.id} no encontrada.`);

    await prisma.managerTeam.update({
      where: { id: item.id },
      data: { displayName: name },
    });

    await prisma.staff.updateMany({
      where: { role: 'MANAGER', managerTeam: item.id },
      data: { displayName: name },
    });
  }

  return listActiveManagerTeams();
}

export async function addManagerTeam(displayName?: string): Promise<ManagerTeamRow[]> {
  if (!isDatabaseEnabled()) throw new Error('Agregar gerencias requiere PostgreSQL.');

  const maxSort = await prisma.managerTeam.aggregate({
    where: { active: true },
    _max: { sortOrder: true },
  });
  const nextSort = (maxSort._max.sortOrder ?? 0) + 1;

  const created = await prisma.managerTeam.create({
    data: {
      displayName: displayName?.trim() || 'Nueva gerencia',
      sortOrder: nextSort,
    },
  });

  if (!displayName?.trim()) {
    await prisma.managerTeam.update({
      where: { id: created.id },
      data: { displayName: `Gerencia ${created.id}` },
    });
  }

  return listActiveManagerTeams();
}

export async function removeManagerTeam(id: number, passwordHash?: string): Promise<ManagerTeamRow[]> {
  if (!isDatabaseEnabled()) throw new Error('Eliminar gerencias requiere PostgreSQL.');

  const team = await prisma.managerTeam.findFirst({ where: { id, active: true } });
  if (!team) throw new Error('Gerencia no encontrada.');

  const activeTeams = await prisma.managerTeam.count({ where: { active: true } });
  if (activeTeams <= 1) throw new Error('Debe existir al menos una gerencia activa.');

  const advisorCount = await prisma.staff.count({
    where: { role: 'ADVISOR', active: true, managerTeam: id },
  });
  if (advisorCount > 0) {
    throw new Error(
      `No se puede eliminar: ${advisorCount} asesor(es) aún pertenecen a esta gerencia. Reasígnalos primero.`,
    );
  }

  await prisma.managerTeam.update({
    where: { id },
    data: { active: false },
  });

  await prisma.staff.updateMany({
    where: { role: 'MANAGER', managerTeam: id },
    data: { active: false },
  });

  return listActiveManagerTeams();
}

export async function ensureManagerStaffForTeam(teamId: number, passwordHash: string): Promise<void> {
  if (!isDatabaseEnabled()) return;
  const team = await prisma.managerTeam.findFirst({ where: { id: teamId, active: true } });
  if (!team) return;

  const email = managerEmail(teamId);
  await prisma.staff.upsert({
    where: { email },
    update: { displayName: team.displayName, role: 'MANAGER', managerTeam: teamId, active: true },
    create: {
      email,
      displayName: team.displayName,
      role: 'MANAGER',
      managerTeam: teamId,
      passwordHash,
    },
  });
}
