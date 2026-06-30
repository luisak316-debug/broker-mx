import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { AuditLog, CashRequest, Client } from '../types/admin';

const PERSIST_DIR = path.join(process.cwd(), 'data', 'persist');
const PERSIST_FILE = path.join(PERSIST_DIR, 'store.json');

export interface LegacyPersistSnapshot {
  clients: Client[];
  cashRequests: CashRequest[];
  auditLogs: AuditLog[];
  nextClientSeq: number;
  savedAt: string;
}

export function loadLegacyPersist(): LegacyPersistSnapshot | null {
  try {
    if (!existsSync(PERSIST_FILE)) return null;
    const raw = readFileSync(PERSIST_FILE, 'utf8');
    return JSON.parse(raw) as LegacyPersistSnapshot;
  } catch {
    return null;
  }
}

export function saveLegacyPersist(snapshot: LegacyPersistSnapshot): void {
  try {
    if (!existsSync(PERSIST_DIR)) mkdirSync(PERSIST_DIR, { recursive: true });
    writeFileSync(
      PERSIST_FILE,
      JSON.stringify({ ...snapshot, savedAt: new Date().toISOString() }, null, 0),
      'utf8',
    );
  } catch (err) {
    console.error('[broker.mx] No se pudo guardar persistencia local:', err);
  }
}
