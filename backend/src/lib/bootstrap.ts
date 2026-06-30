import { execSync } from 'node:child_process';
import path from 'node:path';
import { prisma } from './prisma';
import { hashPassword } from '../services/security.service';
import { ALL_INSTRUMENTS } from '../data/instruments';

/** Migraciones + datos mínimos (staff, instrumentos). Los clientes registrados persisten en BD. */
export async function bootstrapDatabase(): Promise<void> {
  const backendRoot = path.resolve(__dirname, '..', '..');
  try {
    execSync('npx prisma migrate deploy', {
      cwd: backendRoot,
      stdio: 'inherit',
      env: process.env,
    });
  } catch {
    execSync('npx prisma db push --accept-data-loss', {
      cwd: backendRoot,
      stdio: 'inherit',
      env: process.env,
    });
  }

  await seedInstruments();
  await seedStaff();
}

async function seedInstruments(): Promise<void> {
  const count = await prisma.instrument.count();
  if (count > 0) return;

  for (const inst of ALL_INSTRUMENTS) {
    await prisma.instrument.create({
      data: {
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
