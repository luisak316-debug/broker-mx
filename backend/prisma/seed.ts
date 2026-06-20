import { PrismaClient } from '@prisma/client';
import { ALL_INSTRUMENTS } from '../src/data/instruments';
import { hashPassword } from '../src/services/security.service';

const prisma = new PrismaClient();

async function main() {
  // Catálogo de instrumentos
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

  // Personal interno (RBAC). Contraseña demo: Admin1234
  const adminStaff = await prisma.staff.upsert({
    where: { email: 'admin@brokermx.com' },
    update: {},
    create: {
      email: 'admin@brokermx.com',
      passwordHash: hashPassword('Admin1234'),
      displayName: 'Administración',
      role: 'ADMIN',
    },
  });
  const advisor = await prisma.staff.upsert({
    where: { email: 'juan.perez@brokermx.com' },
    update: {},
    create: {
      email: 'juan.perez@brokermx.com',
      passwordHash: hashPassword('Admin1234'),
      displayName: 'Juan Pérez',
      role: 'ADVISOR',
    },
  });
  await prisma.staff.upsert({
    where: { email: 'laura.cumplimiento@brokermx.com' },
    update: {},
    create: {
      email: 'laura.cumplimiento@brokermx.com',
      passwordHash: hashPassword('Admin1234'),
      displayName: 'Laura Cumplimiento',
      role: 'COMPLIANCE',
    },
  });

  // Cliente demo con balance simulado en MXN y asesor asignado
  const user = await prisma.user.upsert({
    where: { email: 'demo@brokermx.com' },
    update: {},
    create: {
      email: 'demo@brokermx.com',
      passwordHash: hashPassword('Cliente1234'),
      displayName: 'Cliente Demo',
      kycStatus: 'APPROVED',
      isLead: false,
      totalInvestedMxn: 45000,
      advisorId: advisor.id,
      depositBeneficiary: 'Corporativo Consorcio Óptimo Andrade Estrella S.A.S. de C.V.',
      depositBank: 'BBVA',
      depositAccountNumber: '0123456789',
      depositClabe: '012180001234567895',
      depositReference: 'INV-1001',
      depositUpdatedAt: new Date(),
      depositUpdatedById: advisor.id,
      balance: { create: { cashMxn: 100000 } },
    },
  });

  console.log(`Seed completado. Admin: ${adminStaff.email} · Asesor: ${advisor.email} · Cliente: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
