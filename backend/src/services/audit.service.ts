import { prisma } from '../lib/prisma';
import { findClient } from '../repositories/client.repository';
import type { AuditLog } from '../types/admin';
import type { SessionPayload } from '../services/security.service';

export async function record(params: {
  actor: SessionPayload;
  action: string;
  targetUserId?: string;
  description: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
}): Promise<AuditLog> {
  const target = params.targetUserId ? await findClient(params.targetUserId) : undefined;

  const row = await prisma.auditLog.create({
    data: {
      staffId: params.actor.sub,
      action: params.action,
      targetUserId: target?.internalId,
      description: params.description,
      beforeJson: params.before ? JSON.stringify(params.before) : null,
      afterJson: params.after ? JSON.stringify(params.after) : null,
      ipAddress: params.ip,
    },
    include: { staff: true, targetUser: true },
  });

  return {
    id: row.id,
    staffId: row.staffId,
    staffName: row.staff.displayName,
    action: row.action,
    targetUserId: target?.id,
    targetUserName: target?.displayName ?? row.targetUser?.displayName,
    description: row.description,
    before: params.before,
    after: params.after,
    ipAddress: row.ipAddress ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export async function list(filter?: {
  staffId?: string;
  targetUserId?: string;
}): Promise<AuditLog[]> {
  const targetInternal =
    filter?.targetUserId != null
      ? (await findClient(filter.targetUserId))?.internalId
      : undefined;

  const rows = await prisma.auditLog.findMany({
    where: {
      staffId: filter?.staffId,
      targetUserId: targetInternal,
    },
    include: { staff: true, targetUser: true },
    orderBy: { createdAt: 'desc' },
    take: 500,
  });

  return rows.map((row) => ({
    id: row.id,
    staffId: row.staffId,
    staffName: row.staff.displayName,
    action: row.action,
    targetUserId: row.targetUser?.clientCode,
    targetUserName: row.targetUser?.displayName,
    description: row.description,
    before: row.beforeJson ? JSON.parse(row.beforeJson) : undefined,
    after: row.afterJson ? JSON.parse(row.afterJson) : undefined,
    ipAddress: row.ipAddress ?? undefined,
    createdAt: row.createdAt.toISOString(),
  }));
}
