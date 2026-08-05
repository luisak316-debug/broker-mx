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

async function removeAllAdvisors(): Promise<number> {
  const advisors = await prisma.staff.findMany({
    where: { role: 'ADVISOR' },
    select: { id: true },
  });
  if (advisors.length === 0) return 0;

  const ids = advisors.map((a) => a.id);
  await prisma.user.updateMany({
    where: { advisorId: { in: ids } },
    data: { advisorId: null },
  });

  const deleted = await prisma.staff.deleteMany({ where: { role: 'ADVISOR' } });
  return deleted.count;
}

/**
 * Elimina asesores demo y crea los reales del bloc INVERMAX.
 * Requiere ADVISOR_BOOTSTRAP_PASSWORD en Render (misma contraseña inicial del bloc).
 * Activar con SYNC_REAL_ADVISORS=true (una vez o tras cada cambio de lista).
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
  const existingReal = await prisma.staff.count({
    where: { role: 'ADVISOR', loginAccess: { not: null }, active: true },
  });
  if (!force && existingReal >= REAL_ADVISOR_ROWS.length) {
    return;
  }

  const removed = await removeAllAdvisors();
  console.log(`[broker.mx] Asesores demo eliminados: ${removed}`);

  const passwordHash = hashPassword(password);
  for (const row of REAL_ADVISOR_ROWS) {
    const access = normalizeAdvisorLoginAccess(row.access);
    const displayName = titleCaseName(row.name);
    const email = advisorInternalEmail(access);

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
    console.log(`[broker.mx] Asesor activo: ${displayName} (acceso ${access})`);
  }
}
