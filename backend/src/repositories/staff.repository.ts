import { randomUUID } from 'node:crypto';
import { isDatabaseEnabled } from '../lib/database';
import * as legacy from '../data/adminStore';
import { prisma } from '../lib/prisma';
import { isAdminEmail, managerEmail } from '../config/brand';
import type { Staff } from '../types/admin';

function mapStaff(row: {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: Staff['role'];
  managerTeam: number | null;
  phone?: string | null;
  hireDate?: Date | null;
  inactiveDate?: Date | null;
  active: boolean;
  lastLoginAt: Date | null;
  createdAt: Date;
}): Staff {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    displayName: isAdminEmail(row.email) ? 'Administración' : row.displayName,
    role: row.role,
    managerTeam: row.managerTeam,
    phone: row.phone ?? null,
    hireDate: row.hireDate ? row.hireDate.toISOString().slice(0, 10) : null,
    inactiveDate: row.inactiveDate ? row.inactiveDate.toISOString().slice(0, 10) : null,
    active: row.active,
    lastLoginAt: row.lastLoginAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

function parseDateOnly(value: string | null | undefined): Date | null | undefined {
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  return new Date(`${value}T12:00:00.000Z`);
}

function normalizeAdvisorPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (!/^\d{10}$/.test(digits)) {
    throw new Error('Teléfono de 10 dígitos requerido.');
  }
  return digits;
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

export async function resolveActiveAdvisorDisplayName(
  advisorId: string | undefined | null,
): Promise<string | undefined> {
  if (!advisorId) return undefined;
  if (!isDatabaseEnabled()) {
    const staff = legacy.findStaffById(advisorId);
    return staff?.active && staff.role === 'ADVISOR' ? staff.displayName : undefined;
  }

  const row = await prisma.staff.findFirst({
    where: { id: advisorId, role: 'ADVISOR', active: true },
    select: { displayName: true },
  });
  return row?.displayName;
}

async function pickReplacementAdvisor(excludeId?: string): Promise<string | null> {
  if (!isDatabaseEnabled()) return null;

  const advisor = await prisma.staff.findFirst({
    where: {
      role: 'ADVISOR',
      active: true,
      ...(excludeId ? { id: { not: excludeId } } : {}),
    },
    orderBy: { createdAt: 'asc' },
    select: { id: true },
  });
  return advisor?.id ?? null;
}

/** Reasigna clientes cuyo asesor ya no está activo (p. ej. Juan Pérez eliminado). */
export async function reassignOrphanedClientAdvisors(): Promise<number> {
  if (!isDatabaseEnabled()) return 0;

  const replacementId = await pickReplacementAdvisor();
  const result = await prisma.user.updateMany({
    where: {
      advisorId: { not: null },
      advisor: { OR: [{ active: false }, { role: { not: 'ADVISOR' } }] },
    },
    data: { advisorId: replacementId },
  });

  if (result.count > 0) {
    console.log(`[broker.mx] ${result.count} cliente(s) reasignados de asesores inactivos.`);
  }
  return result.count;
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
  if (isAdminEmail(staff.email)) staff.displayName = 'Administración';
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
      displayName: `Gerencia ${team}`,
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
      displayName: `Gerencia ${team}`,
      managerId: mgr?.id,
      advisorCount: advisorCounts[i],
    };
  });
}

export async function ensureManagerTeamsSeeded(passwordHash: string): Promise<void> {
  if (!isDatabaseEnabled()) return;

  for (let team = 1; team <= 4; team++) {
    const email = managerEmail(team);
    await prisma.staff.upsert({
      where: { email },
      update: { displayName: `Gerencia ${team}`, role: 'MANAGER', managerTeam: team },
      create: {
        email,
        displayName: `Gerencia ${team}`,
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
  phone?: string | null;
  hireDate?: string | null;
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
      phone: data.phone ? normalizeAdvisorPhone(data.phone) : null,
      hireDate: parseDateOnly(data.hireDate ?? undefined) ?? null,
    },
  });
  return mapStaff(row);
}

export async function updateAdvisorPhone(
  advisorId: string,
  phone: string,
  changedById: string,
): Promise<Staff> {
  if (!isDatabaseEnabled()) {
    throw new Error('Actualizar teléfono requiere PostgreSQL.');
  }

  const normalized = normalizeAdvisorPhone(phone);
  const current = await prisma.staff.findFirst({
    where: { id: advisorId, role: 'ADVISOR', active: true },
  });
  if (!current) throw new Error('Asesor no encontrado.');

  if (current.phone && current.phone !== normalized) {
    await prisma.advisorPhoneHistory.create({
      data: {
        advisorId,
        phone: current.phone,
        replacedById: changedById,
      },
    });
  }

  const row = await prisma.staff.update({
    where: { id: advisorId },
    data: { phone: normalized },
  });
  return mapStaff(row);
}

export async function updateAdvisorDates(
  advisorId: string,
  data: { hireDate?: string | null; inactiveDate?: string | null },
): Promise<Staff> {
  if (!isDatabaseEnabled()) {
    throw new Error('Actualizar fechas requiere PostgreSQL.');
  }

  const current = await prisma.staff.findFirst({
    where: { id: advisorId, role: 'ADVISOR', active: true },
  });
  if (!current) throw new Error('Asesor no encontrado.');

  const row = await prisma.staff.update({
    where: { id: advisorId },
    data: {
      ...(data.hireDate !== undefined ? { hireDate: parseDateOnly(data.hireDate) } : {}),
      ...(data.inactiveDate !== undefined ? { inactiveDate: parseDateOnly(data.inactiveDate) } : {}),
    },
  });
  return mapStaff(row);
}

export async function listAdvisorPhoneHistory(
  advisorId: string,
): Promise<Array<{ id: string; phone: string; replacedAt: string; replacedByName?: string }>> {
  if (!isDatabaseEnabled()) return [];

  const rows = await prisma.advisorPhoneHistory.findMany({
    where: { advisorId },
    orderBy: { replacedAt: 'desc' },
    include: { replacedBy: { select: { displayName: true } } },
  });

  return rows.map((row) => ({
    id: row.id,
    phone: row.phone,
    replacedAt: row.replacedAt.toISOString(),
    replacedByName: row.replacedBy?.displayName,
  }));
}

export async function deactivateStaff(id: string, inactiveDate?: string | null): Promise<void> {
  if (!isDatabaseEnabled()) {
    throw new Error('Eliminar asesores requiere PostgreSQL.');
  }

  const date = inactiveDate
    ? parseDateOnly(inactiveDate)
    : parseDateOnly(new Date().toISOString().slice(0, 10));

  await prisma.staff.update({
    where: { id },
    data: {
      active: false,
      inactiveDate: date ?? undefined,
    },
  });

  const replacementId = await pickReplacementAdvisor(id);
  await prisma.user.updateMany({
    where: { advisorId: id },
    data: { advisorId: replacementId },
  });
}
