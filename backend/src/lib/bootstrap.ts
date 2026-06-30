import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { initLegacyStore } from '../data/adminStore';
import { applyDatabaseEnv, isDatabaseEnabled } from './database';
import { purgeAllDemoClients } from './purgeDemoClients';
import { prisma } from './prisma';
import { hashPassword } from '../services/security.service';
import { ALL_INSTRUMENTS } from '../data/instruments';

export type StorageMode = 'postgres' | 'legacy';

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function resolveBackendRoot(): string {
  const fromDist = path.resolve(__dirname, '..', '..');
  if (existsSync(path.join(fromDist, 'prisma', 'schema.prisma'))) return fromDist;

  const fromCwd = path.join(process.cwd(), 'backend');
  if (existsSync(path.join(fromCwd, 'prisma', 'schema.prisma'))) return fromCwd;

  if (existsSync(path.join(process.cwd(), 'prisma', 'schema.prisma'))) return process.cwd();

  return fromDist;
}

function resolvePrismaBin(): string {
  const candidates = [
    resolveBackendRoot(),
    path.join(resolveBackendRoot(), '..'),
    process.cwd(),
  ];
  for (const root of candidates) {
    const bin = path.join(root, 'node_modules', '.bin', 'prisma');
    if (existsSync(bin)) return bin;
  }
  return 'prisma';
}

function ensureSchema(): void {
  const backendRoot = resolveBackendRoot();
  const prismaBin = resolvePrismaBin();
  execFileSync(prismaBin, ['db', 'push', '--accept-data-loss'], {
    cwd: backendRoot,
    env: process.env,
    stdio: 'inherit',
  });
}

async function ensureSchemaWithRetry(maxAttempts = 3): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      ensureSchema();
      return;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        console.warn(`[broker.mx] db push intento ${attempt}/${maxAttempts} falló, reintentando…`);
        await sleep(4000);
      }
    }
  }
  throw lastError;
}

/** Conecta BD, aplica schema y siembra staff/instrumentos si faltan. */
export async function bootstrapDatabase(): Promise<{ mode: StorageMode; dbOk: boolean }> {
  applyDatabaseEnv();

  if (!isDatabaseEnabled()) {
    initLegacyStore();
    await purgeAllDemoClients();
    console.warn(
      '[broker.mx] DATABASE_URL no configurada — modo legacy (archivo local en data/persist).',
    );
    return { mode: 'legacy', dbOk: true };
  }

  try {
    await ensureSchemaWithRetry();
    await prisma.$connect();
    await seedInstruments();
    await seedStaff();
    await purgeAllDemoClients();
    console.log('[broker.mx] PostgreSQL conectada y lista.');
    return { mode: 'postgres', dbOk: true };
  } catch (err) {
    console.error('[broker.mx] PostgreSQL no disponible, usando modo legacy:', err);
    initLegacyStore();
    await purgeAllDemoClients();
    return { mode: 'legacy', dbOk: false };
  }
}

async function seedInstruments(): Promise<void> {
  for (const inst of ALL_INSTRUMENTS) {
    await prisma.instrument.upsert({
      where: { symbol: inst.symbol },
      update: {
        name: inst.name,
        assetClass: inst.assetClass,
        currency: inst.currency,
        group: (inst.meta?.group as string) ?? null,
        exchange: (inst.meta?.exchange as string) ?? null,
      },
      create: {
        symbol: inst.symbol,
        name: inst.name,
        assetClass: inst.assetClass,
        currency: inst.currency,
        group: (inst.meta?.group as string) ?? null,
        exchange: (inst.meta?.exchange as string) ?? null,
      },
    });
  }
}

async function seedStaff(): Promise<void> {
  const count = await prisma.staff.count();
  if (count > 0) return;

  const demoHash = hashPassword('Admin1234');
  const staffRows = [
    { email: 'admin@brokermx.com', displayName: 'Administración', role: 'ADMIN' as const },
    { email: 'juan.perez@brokermx.com', displayName: 'Juan Pérez', role: 'ADVISOR' as const },
    { email: 'laura.cumplimiento@brokermx.com', displayName: 'Laura Cumplimiento', role: 'COMPLIANCE' as const },
    { email: 'soporte@brokermx.com', displayName: 'Carlos Soporte', role: 'SUPPORT' as const },
  ];

  for (const row of staffRows) {
    await prisma.staff.create({
      data: {
        email: row.email,
        displayName: row.displayName,
        role: row.role,
        passwordHash: demoHash,
      },
    });
  }
}

export async function pingDatabase(): Promise<boolean> {
  if (!isDatabaseEnabled()) return true;
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
