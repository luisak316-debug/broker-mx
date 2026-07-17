import { PrismaClient } from '@prisma/client';
import { ALL_INSTRUMENTS } from '../src/data/instruments';
import { hashPassword } from '../src/services/security.service';
import { STAFF_EMAILS } from '../src/config/brand';

const prisma = new PrismaClient();

async function main() {
  for (const inst of ALL_INSTRUMENTS) {
    await prisma.instrument.upsert({
      where: { symbol: inst.symbol },
      update: {},
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

  const demoHash = hashPassword('Admin1234');
  const adminStaff = await prisma.staff.upsert({
    where: { email: STAFF_EMAILS.admin },
    update: {},
    create: {
      email: STAFF_EMAILS.admin,
      passwordHash: demoHash,
      displayName: 'Administración',
      role: 'ADMIN',
    },
  });
  await prisma.staff.upsert({
    where: { email: STAFF_EMAILS.compliance },
    update: {},
    create: {
      email: STAFF_EMAILS.compliance,
      passwordHash: demoHash,
      displayName: 'Laura Cumplimiento',
      role: 'COMPLIANCE',
    },
  });
  await prisma.staff.upsert({
    where: { email: STAFF_EMAILS.support },
    update: {},
    create: {
      email: STAFF_EMAILS.support,
      passwordHash: demoHash,
      displayName: 'Carlos Soporte',
      role: 'SUPPORT',
    },
  });

  console.log(`Seed completado. Admin: ${adminStaff.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
