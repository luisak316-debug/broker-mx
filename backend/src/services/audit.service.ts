import { randomUUID } from 'node:crypto';
import { isDatabaseEnabled } from '../lib/database';
import * as legacy from '../data/adminStore';
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

  if (!isDatabaseEnabled()) {
    const entry: AuditLog = {
      id: randomUUID(),
      staffId: params.actor.sub,
      staffName: params.actor.name,
      action: params.action,
      targetUserId: target?.id,
      targetUserName: target?.displayName,
      description: params.description,
      before: params.before,
      after: params.after,
      ipAddress: params.ip,
      createdAt: new Date().toISOString(),
    };
    return legacy.appendAuditLog(entry);
  }

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
  if (!isDatabaseEnabled()) {
    let rows = [...legacy.auditLogs];
    if (filter?.staffId) rows = rows.filter((r) => r.staffId === filter.staffId);
    if (filter?.targetUserId) rows = rows.filter((r) => r.targetUserId === filter.targetUserId);
    return rows.slice(0, 500);
  }

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
