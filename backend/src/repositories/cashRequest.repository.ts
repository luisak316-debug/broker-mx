import { randomUUID } from 'node:crypto';
import { isDatabaseEnabled } from '../lib/database';
import * as legacy from '../data/adminStore';
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
  payoutBank: string | null;
  payoutOwnerName: string | null;
  payoutConcept: string | null;
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
  payoutBank: row.payoutBank ?? undefined,
  payoutOwnerName: row.payoutOwnerName ?? undefined,
  payoutConcept: row.payoutConcept ?? undefined,
  reviewedByName: row.reviewedBy?.displayName,
    reviewedAt: row.reviewedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
  };
}

export async function listCashRequests(status?: string): Promise<CashRequest[]> {
  if (!isDatabaseEnabled()) {
    const rows = status
      ? legacy.cashRequests.filter((r) => r.status === status)
      : legacy.cashRequests;
    return [...rows].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

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
  if (!isDatabaseEnabled()) {
    const request = legacy.cashRequests.find((r) => r.id === id);
    if (!request) return null;
    return {
      id: request.id,
      userId: request.userId,
      type: request.type,
      amountMxn: request.amountMxn,
      method: request.method ?? null,
      status: request.status,
      note: request.note ?? null,
      payoutBank: request.payoutBank ?? null,
      payoutOwnerName: request.payoutOwnerName ?? null,
      payoutConcept: request.payoutConcept ?? null,
      reviewedAt: request.reviewedAt ? new Date(request.reviewedAt) : null,
      createdAt: new Date(request.createdAt),
      user: {
        id: request.userId,
        displayName: request.clientName,
        clientCode: request.userId,
      },
      reviewedBy: request.reviewedByName ? { displayName: request.reviewedByName } : null,
    };
  }

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
  payoutBank?: string;
  payoutOwnerName?: string;
  payoutConcept?: string;
}): Promise<CashRequest> {
  if (!isDatabaseEnabled()) {
    const client = legacy.findClient(input.userInternalId);
    const request: CashRequest = {
      id: randomUUID(),
      userId: client?.id ?? input.userInternalId,
      clientName: client?.displayName ?? 'Cliente',
      type: input.type,
      amountMxn: input.amountMxn,
      method: input.method,
      note: input.note,
      payoutBank: input.payoutBank,
      payoutOwnerName: input.payoutOwnerName,
      payoutConcept: input.payoutConcept,
      status: 'PENDIENTE',
      createdAt: new Date().toISOString(),
    };
    return legacy.appendCashRequest(request);
  }

  const row = await prisma.cashRequest.create({
    data: {
      userId: input.userInternalId,
      type: input.type,
      amountMxn: input.amountMxn,
      method: input.method,
      note: input.note,
      payoutBank: input.payoutBank,
      payoutOwnerName: input.payoutOwnerName,
      payoutConcept: input.payoutConcept,
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
  if (!isDatabaseEnabled()) {
    return legacy.reviewLegacyCashRequest(id, {
      status: data.status,
      note: data.note,
      reviewedByName: data.reviewedByName,
    });
  }

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
  if (!isDatabaseEnabled()) {
    return legacy.cashRequests.filter((r) => r.status === 'PENDIENTE').length;
  }

  return prisma.cashRequest.count({ where: { status: 'PENDIENTE' } });
}
