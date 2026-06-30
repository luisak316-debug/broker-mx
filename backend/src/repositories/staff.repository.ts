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

export async function createStaff(data: {
  email: string;
  displayName: string;
  role: Staff['role'];
  passwordHash: string;
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
