import { existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { initLegacyStore } from '../data/adminStore';
import { applyDatabaseEnv, isDatabaseEnabled } from './database';
import { purgeAllDemoClients } from './purgeDemoClients';
import { prisma } from './prisma';
import {
  ensureManagerTeamsSeeded,
  reassignOrphanedClientAdvisors,
} from '../repositories/staff.repository';
import { hashPassword } from '../services/security.service';
import { ALL_INSTRUMENTS } from '../data/instruments';
import {
  LEGACY_STAFF_EMAIL_MAP,
  STAFF_EMAILS,
  managerEmail,
  CLIENT_PHONE_EMAIL_DOMAIN,
} from '../config/brand';

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
  execFileSync(prismaBin, ['db', 'push', '--accept-data-loss', '--skip-generate'], {
    cwd: backendRoot,
    env: process.env,
    stdio: 'inherit',
  });
}

async function ensureSchemaWithRetry(maxAttempts = 2): Promise<void> {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      ensureSchema();
      return;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts) {
        console.warn(`[broker.mx] db push intento ${attempt}/${maxAttempts} falló, reintentando…`);
        await sleep(2000);
      }
    }
  }
  throw lastError;
}

function shouldRunDbPush(): boolean {
  return process.env.SKIP_DB_PUSH !== 'true';
}

/** Arranque rápido: conecta BD y deja la API escuchando en segundos. */
export async function bootstrapDatabaseFast(): Promise<{ mode: StorageMode; dbOk: boolean }> {
  applyDatabaseEnv();

  if (!isDatabaseEnabled()) {
    initLegacyStore();
    return { mode: 'legacy', dbOk: true };
  }

  try {
    await prisma.$connect();
    console.log('[broker.mx] PostgreSQL conectada.');
    return { mode: 'postgres', dbOk: true };
  } catch (err) {
    console.error('[broker.mx] PostgreSQL no disponible, usando modo legacy:', err);
    initLegacyStore();
    return { mode: 'legacy', dbOk: false };
  }
}

/** Tareas pesadas en segundo plano (schema, seed, limpieza). */
async function runSlowBootstrapTasks(): Promise<void> {
  if (!isDatabaseEnabled()) {
    await purgeAllDemoClients();
    return;
  }

  try {
    if (shouldRunDbPush()) {
      await ensureSchemaWithRetry();
    }
    await seedInstruments();
    await migrateLegacyBrand();
    await seedStaff();
    await reassignOrphanedClientAdvisors();
    await purgeAllDemoClients();
    console.log('[broker.mx] Sincronización en segundo plano completada.');
  } catch (err) {
    console.error('[broker.mx] Sincronización en segundo plano falló:', err);
  }
}

export function bootstrapDatabaseSlow(): void {
  void runSlowBootstrapTasks();
}

/** Compatibilidad: arranque completo (scripts locales). */
export async function bootstrapDatabase(): Promise<{ mode: StorageMode; dbOk: boolean }> {
  const boot = await bootstrapDatabaseFast();
  await runSlowBootstrapTasks();
  return boot;
}

async function seedInstruments(): Promise<void> {
  await Promise.all(
    ALL_INSTRUMENTS.map((inst) =>
      prisma.instrument.upsert({
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
      }),
    ),
  );
}

async function migrateLegacyBrand(): Promise<void> {
  const staffMap: Record<string, string> = { ...LEGACY_STAFF_EMAIL_MAP };
  for (let team = 1; team <= 4; team++) {
    staffMap[`gerente${team}@brokermx.com`] = managerEmail(team);
  }

  for (const [oldEmail, newEmail] of Object.entries(staffMap)) {
    const row = await prisma.staff.findFirst({
      where: { email: { equals: oldEmail, mode: 'insensitive' } },
    });
    if (!row) continue;

    const conflict = await prisma.staff.findFirst({
      where: { email: { equals: newEmail, mode: 'insensitive' } },
    });
    if (conflict && conflict.id !== row.id) {
      await prisma.staff.delete({ where: { id: row.id } });
      continue;
    }
    if (row.email !== newEmail) {
      await prisma.staff.update({ where: { id: row.id }, data: { email: newEmail } });
    }
  }

  const legacyClients = await prisma.user.findMany({
    where: { email: { endsWith: '@celular.brokermx', mode: 'insensitive' } },
    select: { id: true, email: true },
  });
  for (const user of legacyClients) {
    const newEmail = user.email.replace(
      /@celular\.brokermx$/i,
      `@${CLIENT_PHONE_EMAIL_DOMAIN}`,
    );
    if (newEmail === user.email) continue;
    const conflict = await prisma.user.findFirst({
      where: { email: { equals: newEmail, mode: 'insensitive' } },
    });
    if (conflict && conflict.id !== user.id) continue;
    await prisma.user.update({ where: { id: user.id }, data: { email: newEmail } });
  }
}

async function seedStaff(): Promise<void> {
  const demoHash = hashPassword('Admin1234');
  const staffRows = [
    { email: STAFF_EMAILS.admin, displayName: 'Administración', role: 'ADMIN' as const },
    { email: STAFF_EMAILS.supervisor, displayName: 'María Supervisora', role: 'SUPERVISOR' as const },
    { email: STAFF_EMAILS.compliance, displayName: 'Laura Cumplimiento', role: 'COMPLIANCE' as const },
    { email: STAFF_EMAILS.support, displayName: 'Carlos Soporte', role: 'SUPPORT' as const },
  ];

  const count = await prisma.staff.count();
  if (count === 0) {
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
    return;
  }

  for (const row of staffRows) {
    await prisma.staff.upsert({
      where: { email: row.email },
      update: { displayName: row.displayName, role: row.role },
      create: {
        email: row.email,
        displayName: row.displayName,
        role: row.role,
        passwordHash: demoHash,
      },
    });
  }

  await ensureManagerTeamsSeeded(demoHash);
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
