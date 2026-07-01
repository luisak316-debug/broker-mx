import { randomUUID } from 'node:crypto';
import { isDatabaseEnabled } from '../lib/database';
import * as legacy from '../data/adminStore';
import { prisma } from '../lib/prisma';
import type { Staff } from '../types/admin';

function mapStaff(row: {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: Staff['role'];
  managerTeam: number | null;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}): Staff {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    displayName: row.email === 'admin@brokermx.com' ? 'Administración' : row.displayName,
    role: row.role,
    managerTeam: row.managerTeam,
    active: row.active,
    lastLoginAt: row.lastLoginAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function findStaffByEmail(email: string): Promise<Staff | undefined> {
  if (!isDatabaseEnabled()) return legacy.findStaffByEmail(email);

  const row = await prisma.staff.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  });
  return row ? mapStaff(row) : undefined;
}

export async function findStaffById(id: string): Promise<Staff | undefined> {
  if (!isDatabaseEnabled()) return legacy.findStaffById(id);

  const row = await prisma.staff.findUnique({ where: { id } });
  return row ? mapStaff(row) : undefined;
}

export async function touchStaffLogin(id: string): Promise<void> {
  if (!isDatabaseEnabled()) {
    legacy.touchStaffLogin(id);
    return;
  }

  await prisma.staff.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}

export function normalizeStaffDisplay(staff: Staff): Staff {
  if (staff.email === 'admin@brokermx.com') staff.displayName = 'Administración';
  return staff;
}

export async function listStaffByRole(role: Staff['role']): Promise<Staff[]> {
  if (!isDatabaseEnabled()) return legacy.staff.filter((s) => s.role === role && s.active);

  const rows = await prisma.staff.findMany({
    where: { role, active: true },
    orderBy: { displayName: 'asc' },
  });
  return rows.map(mapStaff);
}

export async function listAdvisorsByManagerTeam(team: number): Promise<Staff[]> {
  if (!isDatabaseEnabled()) {
    return legacy.staff.filter(
      (s) => s.role === 'ADVISOR' && s.active && (s as Staff).managerTeam === team,
    );
  }

  const rows = await prisma.staff.findMany({
    where: { role: 'ADVISOR', active: true, managerTeam: team },
    orderBy: { displayName: 'asc' },
  });
  return rows.map(mapStaff);
}

export async function listManagerTeams(): Promise<
  Array<{ team: number; displayName: string; managerId?: string; advisorCount: number }>
> {
  const teams = [1, 2, 3, 4] as const;
  if (!isDatabaseEnabled()) {
    return teams.map((team) => ({
      team,
      displayName: `Gerente ${team}`,
      advisorCount: legacy.staff.filter(
        (s) => s.role === 'ADVISOR' && s.active && (s as Staff).managerTeam === team,
      ).length,
    }));
  }

  const managers = await prisma.staff.findMany({
    where: { role: 'MANAGER', active: true, managerTeam: { in: [...teams] } },
  });
  const advisorCounts = await Promise.all(
    teams.map((team) =>
      prisma.staff.count({ where: { role: 'ADVISOR', active: true, managerTeam: team } }),
    ),
  );

  return teams.map((team, i) => {
    const mgr = managers.find((m) => m.managerTeam === team);
    return {
      team,
      displayName: mgr?.displayName ?? `Gerente ${team}`,
      managerId: mgr?.id,
      advisorCount: advisorCounts[i],
    };
  });
}

export async function ensureManagerTeamsSeeded(passwordHash: string): Promise<void> {
  if (!isDatabaseEnabled()) return;

  for (let team = 1; team <= 4; team++) {
    const email = `gerente${team}@brokermx.com`;
    await prisma.staff.upsert({
      where: { email },
      update: { displayName: `Gerente ${team}`, role: 'MANAGER', managerTeam: team, active: true },
      create: {
        email,
        displayName: `Gerente ${team}`,
        role: 'MANAGER',
        managerTeam: team,
        passwordHash,
      },
    });
  }
}

export async function createStaff(data: {
  email: string;
  displayName: string;
  role: Staff['role'];
  passwordHash: string;
  managerTeam?: number | null;
}): Promise<Staff> {
  if (!isDatabaseEnabled()) {
    throw new Error('Crear asesores requiere PostgreSQL.');
  }

  const row = await prisma.staff.create({
    data: {
      email: data.email.toLowerCase().trim(),
      displayName: data.displayName.trim(),
      role: data.role,
      passwordHash: data.passwordHash,
      managerTeam: data.managerTeam ?? null,
    },
  });
  return mapStaff(row);
}

export async function deactivateStaff(id: string): Promise<void> {
  if (!isDatabaseEnabled()) {
    throw new Error('Eliminar asesores requiere PostgreSQL.');
  }

  await prisma.staff.update({
    where: { id },
    data: { active: false },
  });
}
