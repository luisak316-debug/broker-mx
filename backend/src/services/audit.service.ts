import { randomUUID } from 'node:crypto';
import { auditLogs, findClient } from '../data/adminStore';
import type { AuditLog } from '../types/admin';
import type { SessionPayload } from './security.service';

/**
 * Registra automáticamente toda acción sensible del personal interno.
 * Indispensable para prevenir fraude interno y errores manuales.
 */
export function record(params: {
  actor: SessionPayload;
  action: string;
  targetUserId?: string;
  description: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
}): AuditLog {
  const target = params.targetUserId ? findClient(params.targetUserId) : undefined;
  const entry: AuditLog = {
    id: randomUUID(),
    staffId: params.actor.sub,
    staffName: params.actor.name,
    action: params.action,
    targetUserId: params.targetUserId,
    targetUserName: target?.displayName,
    description: params.description,
    before: params.before,
    after: params.after,
    ipAddress: params.ip,
    createdAt: new Date().toISOString(),
  };
  auditLogs.unshift(entry);
  return entry;
}

export function list(filter?: { staffId?: string; targetUserId?: string }): AuditLog[] {
  let items = auditLogs;
  if (filter?.staffId) items = items.filter((l) => l.staffId === filter.staffId);
  if (filter?.targetUserId) items = items.filter((l) => l.targetUserId === filter.targetUserId);
  return items;
}
