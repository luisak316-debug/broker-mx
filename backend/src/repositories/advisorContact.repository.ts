import { isDatabaseEnabled } from '../lib/database';
import { prisma } from '../lib/prisma';
import type { AdvisorContactRow } from '../types/admin';

function startOfDay(d: Date): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
}

function mapRow(row: {
  id: string;
  advisorId: string;
  advisor: { displayName: string };
  assignedById: string;
  assignedBy: { displayName: string };
  clientName: string;
  phone: string;
  email: string;
  description: string;
  assignedDate: Date;
  createdAt: Date;
}): AdvisorContactRow {
  return {
    id: row.id,
    advisorId: row.advisorId,
    advisorName: row.advisor.displayName,
    assignedById: row.assignedById,
    assignedByName: row.assignedBy.displayName,
    clientName: row.clientName,
    phone: row.phone,
    email: row.email,
    description: row.description,
    assignedDate: row.assignedDate.toISOString().slice(0, 10),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listAdvisorContacts(filters: {
  advisorId?: string;
  assignedById?: string;
  year?: number;
  month?: number;
  day?: number;
}): Promise<AdvisorContactRow[]> {
  if (!isDatabaseEnabled()) return [];

  const where: {
    advisorId?: string;
    assignedById?: string;
    assignedDate?: { gte: Date; lt: Date } | Date;
  } = {};

  if (filters.advisorId) where.advisorId = filters.advisorId;
  if (filters.assignedById) where.assignedById = filters.assignedById;

  if (filters.year && filters.month && filters.day) {
    const start = new Date(Date.UTC(filters.year, filters.month - 1, filters.day));
    const end = new Date(Date.UTC(filters.year, filters.month - 1, filters.day + 1));
    where.assignedDate = { gte: start, lt: end };
  } else if (filters.year && filters.month) {
    const start = new Date(Date.UTC(filters.year, filters.month - 1, 1));
    const end = new Date(Date.UTC(filters.year, filters.month, 1));
    where.assignedDate = { gte: start, lt: end };
  } else if (filters.year) {
    const start = new Date(Date.UTC(filters.year, 0, 1));
    const end = new Date(Date.UTC(filters.year + 1, 0, 1));
    where.assignedDate = { gte: start, lt: end };
  }

  const rows = await prisma.advisorContact.findMany({
    where,
    include: { advisor: true, assignedBy: true },
    orderBy: [{ assignedDate: 'desc' }, { createdAt: 'desc' }],
  });

  return rows.map(mapRow);
}

export async function createAdvisorContact(data: {
  advisorId: string;
  assignedById: string;
  clientName: string;
  phone: string;
  email: string;
  description: string;
  assignedDate?: Date;
}): Promise<AdvisorContactRow> {
  if (!isDatabaseEnabled()) {
    throw new Error('Asignar contactos requiere PostgreSQL.');
  }

  const assignedDate = startOfDay(data.assignedDate ?? new Date());

  const row = await prisma.advisorContact.create({
    data: {
      advisorId: data.advisorId,
      assignedById: data.assignedById,
      clientName: data.clientName.trim(),
      phone: data.phone.replace(/\D/g, '').slice(-10),
      email: data.email.trim().toLowerCase(),
      description: data.description.trim(),
      assignedDate,
    },
    include: { advisor: true, assignedBy: true },
  });

  return mapRow(row);
}

export async function createAdvisorContactsBulk(
  items: Array<{
    advisorId: string;
    assignedById: string;
    clientName: string;
    phone: string;
    email: string;
    description: string;
    assignedDate: Date;
  }>,
): Promise<AdvisorContactRow[]> {
  if (!isDatabaseEnabled()) {
    throw new Error('Asignación masiva requiere PostgreSQL.');
  }

  const rows = await prisma.$transaction(
    items.map((item) =>
      prisma.advisorContact.create({
        data: {
          advisorId: item.advisorId,
          assignedById: item.assignedById,
          clientName: item.clientName,
          phone: item.phone.replace(/\D/g, '').slice(-10),
          email: item.email.trim().toLowerCase(),
          description: item.description,
          assignedDate: startOfDay(item.assignedDate),
        },
        include: { advisor: true, assignedBy: true },
      }),
    ),
  );

  return rows.map(mapRow);
}

export async function deleteAdvisorContact(id: string): Promise<void> {
  if (!isDatabaseEnabled()) {
    throw new Error('Eliminar contactos requiere PostgreSQL.');
  }

  await prisma.advisorContact.delete({ where: { id } });
}
