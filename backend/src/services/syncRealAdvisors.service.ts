import { prisma } from '../lib/prisma';
import { isDatabaseEnabled } from '../lib/database';
import {
  advisorInternalEmail,
  normalizeAdvisorLoginAccess,
  titleCaseName,
} from '../lib/advisorAccess';
import { hashPassword } from './security.service';

/** Asesores reales — acceso numérico + nombre (contraseña vía env). */
const REAL_ADVISOR_ROWS = [
  { access: '21011', name: 'Francisco Medina' },
  { access: '372810444417924', name: 'Javier Hernandez' },
] as const;

async function removeAdvisorsNotInList(keepAccess: string[]): Promise<number> {
  const stale = await prisma.staff.findMany({
    where: {
      role: 'ADVISOR',
      OR: [{ loginAccess: null }, { loginAccess: { notIn: keepAccess } }],
    },
    select: { id: true, displayName: true },
  });
  if (stale.length === 0) return 0;

  const ids = stale.map((a) => a.id);
  await prisma.user.updateMany({
    where: { advisorId: { in: ids } },
    data: { advisorId: null },
  });
  const deleted = await prisma.staff.deleteMany({ where: { id: { in: ids } } });
  for (const a of stale) {
    console.log(`[broker.mx] Asesor demo eliminado: ${a.displayName}`);
  }
  return deleted.count;
}

/**
 * Garantiza que los asesores reales del bloc existan en PostgreSQL.
 * Requiere ADVISOR_BOOTSTRAP_PASSWORD en Render (misma contraseña inicial del bloc).
 * Activar con SYNC_REAL_ADVISORS=true.
 */
export async function syncRealAdvisorsIfConfigured(): Promise<void> {
  if (!isDatabaseEnabled()) return;
  if (process.env.SYNC_REAL_ADVISORS !== 'true') return;

  const password = process.env.ADVISOR_BOOTSTRAP_PASSWORD?.trim();
  if (!password) {
    console.warn('[broker.mx] SYNC_REAL_ADVISORS activo pero falta ADVISOR_BOOTSTRAP_PASSWORD.');
    return;
  }

  const keepAccess = REAL_ADVISOR_ROWS.map((row) => normalizeAdvisorLoginAccess(row.access));
  if (process.env.FORCE_SYNC_REAL_ADVISORS === 'true') {
    await removeAdvisorsNotInList(keepAccess);
  }

  const passwordHash = hashPassword(password);
  for (const row of REAL_ADVISOR_ROWS) {
    const access = normalizeAdvisorLoginAccess(row.access);
    const displayName = titleCaseName(row.name);
    const email = advisorInternalEmail(access);

    await prisma.staff.upsert({
      where: { email },
      create: {
        email,
        loginAccess: access,
        displayName,
        role: 'ADVISOR',
        passwordHash,
        active: true,
      },
      update: {
        loginAccess: access,
        displayName,
        passwordHash,
        active: true,
      },
    });
    console.log(`[broker.mx] Asesor activo: ${displayName} (acceso ${access})`);
  }
}
