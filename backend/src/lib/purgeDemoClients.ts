import { isDatabaseEnabled } from './database';
import { prisma } from './prisma';
import * as legacy from '../data/adminStore';

/** Clientes ficticios del seed antiguo (@correo.com, demo@brokermx.com). */
export function isDemoClientEmail(email: string): boolean {
  const e = email.toLowerCase();
  return e.endsWith('@correo.com') || e === 'demo@brokermx.com';
}

export function purgeDemoClientsLegacy(): number {
  const demoIds = new Set(
    legacy.clients.filter((c) => isDemoClientEmail(c.email)).map((c) => c.id),
  );
  if (demoIds.size === 0) return 0;

  const before = legacy.clients.length;
  legacy.clients.splice(0, legacy.clients.length, ...legacy.clients.filter((c) => !demoIds.has(c.id)));
  legacy.cashRequests.splice(
    0,
    legacy.cashRequests.length,
    ...legacy.cashRequests.filter((r) => !demoIds.has(r.userId)),
  );
  legacy.transactions.splice(
    0,
    legacy.transactions.length,
    ...legacy.transactions.filter((t) => !demoIds.has(t.userId)),
  );
  legacy.recomputeClientSequence();
  legacy.persistAfterPurge();
  return before - legacy.clients.length;
}

export async function purgeDemoClientsDatabase(): Promise<number> {
  if (!isDatabaseEnabled()) return 0;

  const result = await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { endsWith: '@correo.com', mode: 'insensitive' } },
        { email: { equals: 'demo@brokermx.com', mode: 'insensitive' } },
      ],
    },
  });

  return result.count;
}

export async function purgeAllDemoClients(): Promise<void> {
  const legacyRemoved = purgeDemoClientsLegacy();
  if (legacyRemoved > 0) {
    console.log(`[broker.mx] Eliminados ${legacyRemoved} clientes demo (legacy).`);
  }

  try {
    const dbRemoved = await purgeDemoClientsDatabase();
    if (dbRemoved > 0) {
      console.log(`[broker.mx] Eliminados ${dbRemoved} clientes demo (PostgreSQL).`);
    }
  } catch (err) {
    console.warn('[broker.mx] No se pudieron purgar clientes demo en BD:', err);
  }
}
