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
  const row = await prisma.staff.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  });
  return row ? mapStaff(row) : undefined;
}

export async function findStaffById(id: string): Promise<Staff | undefined> {
  const row = await prisma.staff.findUnique({ where: { id } });
  return row ? mapStaff(row) : undefined;
}

export async function touchStaffLogin(id: string): Promise<void> {
  await prisma.staff.update({
    where: { id },
    data: { lastLoginAt: new Date() },
  });
}

export function normalizeStaffDisplay(staff: Staff): Staff {
  if (staff.email === 'admin@brokermx.com') staff.displayName = 'Administración';
  return staff;
}
