import { PrismaClient } from '@prisma/client';
import { ALL_INSTRUMENTS } from '../src/data/instruments';
import { hashPassword } from '../src/services/security.service';

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
    where: { email: 'admin@brokermx.com' },
    update: {},
    create: {
      email: 'admin@brokermx.com',
      passwordHash: demoHash,
      displayName: 'Administración',
      role: 'ADMIN',
    },
  });
  const advisor = await prisma.staff.upsert({
    where: { email: 'juan.perez@brokermx.com' },
    update: {},
    create: {
      email: 'juan.perez@brokermx.com',
      passwordHash: demoHash,
      displayName: 'Juan Pérez',
      role: 'ADVISOR',
    },
  });
  await prisma.staff.upsert({
    where: { email: 'laura.cumplimiento@brokermx.com' },
    update: {},
    create: {
      email: 'laura.cumplimiento@brokermx.com',
      passwordHash: demoHash,
      displayName: 'Laura Cumplimiento',
      role: 'COMPLIANCE',
    },
  });
  await prisma.staff.upsert({
    where: { email: 'soporte@brokermx.com' },
    update: {},
    create: {
      email: 'soporte@brokermx.com',
      passwordHash: demoHash,
      displayName: 'Carlos Soporte',
      role: 'SUPPORT',
    },
  });

  console.log(`Seed completado. Admin: ${adminStaff.email} · Asesor: ${advisor.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
