import { prisma } from '../lib/prisma';
import type { CashRequest, RequestStatus } from '../types/admin';

function dec(v: { toNumber(): number } | number): number {
  return typeof v === 'number' ? v : v.toNumber();
}

function mapRow(row: {
  id: string;
  userId: string;
  type: 'DEPOSITO' | 'RETIRO';
  amountMxn: { toNumber(): number };
  method: string | null;
  status: RequestStatus;
  note: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  user: { displayName: string; clientCode: string };
  reviewedBy?: { displayName: string } | null;
}): CashRequest {
  return {
    id: row.id,
    userId: row.user.clientCode,
    clientName: row.user.displayName,
    type: row.type,
    amountMxn: dec(row.amountMxn),
    method: row.method ?? undefined,
    status: row.status,
    note: row.note ?? undefined,
    reviewedByName: row.reviewedBy?.displayName,
    reviewedAt: row.reviewedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listCashRequests(status?: string): Promise<CashRequest[]> {
  const rows = await prisma.cashRequest.findMany({
    where: status ? { status: status as RequestStatus } : undefined,
    include: {
      user: { select: { displayName: true, clientCode: true } },
      reviewedBy: { select: { displayName: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return rows.map(mapRow);
}

export async function findCashRequest(id: string) {
  return prisma.cashRequest.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, displayName: true, clientCode: true } },
      reviewedBy: { select: { displayName: true } },
    },
  });
}

export async function createCashRequest(input: {
  userInternalId: string;
  type: 'DEPOSITO' | 'RETIRO';
  amountMxn: number;
  method?: string;
  note?: string;
}): Promise<CashRequest> {
  const row = await prisma.cashRequest.create({
    data: {
      userId: input.userInternalId,
      type: input.type,
      amountMxn: input.amountMxn,
      method: input.method,
      note: input.note,
    },
    include: {
      user: { select: { displayName: true, clientCode: true } },
      reviewedBy: { select: { displayName: true } },
    },
  });
  return mapRow(row);
}

export async function reviewCashRequest(
  id: string,
  data: {
    status: RequestStatus;
    note?: string;
    reviewedById: string;
    reviewedByName: string;
  },
): Promise<CashRequest | undefined> {
  const row = await prisma.cashRequest.update({
    where: { id },
    data: {
      status: data.status,
      note: data.note,
      reviewedById: data.reviewedById,
      reviewedAt: new Date(),
    },
    include: {
      user: { select: { displayName: true, clientCode: true } },
      reviewedBy: { select: { displayName: true } },
    },
  });
  return mapRow({ ...row, reviewedBy: { displayName: data.reviewedByName } });
}

export async function countPendingCashRequests(): Promise<number> {
  return prisma.cashRequest.count({ where: { status: 'PENDIENTE' } });
}
