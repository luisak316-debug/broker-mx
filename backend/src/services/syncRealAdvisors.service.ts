import { prisma } from '../lib/prisma';
import { isDatabaseEnabled } from '../lib/database';
import {
  advisorInternalEmail,
  normalizeAdvisorLoginAccess,
  titleCaseName,
} from '../lib/advisorAccess';
import { hashPassword } from './security.service';

/** Semilla inicial — solo si aún no existen en BD (no sustituye altas desde supervisores). */
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
 * Crea asesores del bloc INVERMAX solo si faltan en PostgreSQL.
 * ADVISOR_BOOTSTRAP_PASSWORD en Render = contraseña inicial única (Francisco/Javier).
 * Después de eso, altas y cambios van solo por portal supervisores — no Render.
 */
export async function syncRealAdvisorsIfConfigured(): Promise<void> {
  if (!isDatabaseEnabled()) return;
  if (process.env.SYNC_REAL_ADVISORS !== 'true') return;

  const password = process.env.ADVISOR_BOOTSTRAP_PASSWORD?.trim();
  if (!password) {
    console.warn('[broker.mx] SYNC_REAL_ADVISORS activo pero falta ADVISOR_BOOTSTRAP_PASSWORD.');
    return;
  }

  const force = process.env.FORCE_SYNC_REAL_ADVISORS === 'true';
  const keepAccess = REAL_ADVISOR_ROWS.map((row) => normalizeAdvisorLoginAccess(row.access));
  if (force) {
    await removeAdvisorsNotInList(keepAccess);
  }

  const passwordHash = hashPassword(password);
  for (const row of REAL_ADVISOR_ROWS) {
    const access = normalizeAdvisorLoginAccess(row.access);
    const displayName = titleCaseName(row.name);
    const email = advisorInternalEmail(access);

    const existing = await prisma.staff.findFirst({
      where: { OR: [{ loginAccess: access }, { email }] },
    });

    if (existing) {
      await prisma.staff.update({
        where: { id: existing.id },
        data: {
          loginAccess: access,
          email,
          displayName,
          active: true,
          role: 'ADVISOR',
          ...(force ? { passwordHash } : {}),
        },
      });
      console.log(`[broker.mx] Asesor ya existía (sin tocar contraseña): ${displayName}`);
      continue;
    }

    await prisma.staff.create({
      data: {
        email,
        loginAccess: access,
        displayName,
        role: 'ADVISOR',
        passwordHash,
        active: true,
      },
    });
    console.log(`[broker.mx] Asesor creado en arranque: ${displayName} (acceso ${access})`);
  }
}
