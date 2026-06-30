import type { Prisma } from '@prisma/client';
import { isDatabaseEnabled } from '../lib/database';
import * as legacy from '../data/adminStore';
import { prisma } from '../lib/prisma';
import type { AccountStatus, Client, KycStatus } from '../types/admin';

const userInclude = {
  balance: true,
  advisor: true,
  documents: true,
  cashRequests: {
    where: { type: 'RETIRO' as const },
    orderBy: { createdAt: 'desc' as const },
    take: 1,
  },
} satisfies Prisma.UserInclude;

type DbUser = Prisma.UserGetPayload<{ include: typeof userInclude }>;

function dec(v: Prisma.Decimal | number | null | undefined): number {
  if (v == null) return 0;
  return typeof v === 'number' ? v : Number(v);
}

export function mapUserToClient(user: DbUser): Client {
  return {
    id: user.clientCode,
    internalId: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    plainPassword: user.plainPassword ?? undefined,
    displayName: user.displayName,
    phone: user.phone ?? undefined,
    curp: user.curp ?? undefined,
    rfc: user.rfc ?? undefined,
    kycStatus: user.kycStatus as KycStatus,
    accountStatus: user.accountStatus as AccountStatus,
    riskProfile: user.riskProfile,
    advisorId: user.advisorId ?? undefined,
    cashMxn: dec(user.balance?.cashMxn),
    totalInvestedMxn: dec(user.totalInvestedMxn),
    lastWithdrawalRequestAt: user.cashRequests[0]?.createdAt.toISOString(),
    documents: user.documents.map((d) => ({
      id: d.id,
      type: d.type,
      fileName: d.fileName,
      mimeType: 'application/pdf',
      fileUrl: `/uploads/clients/${user.clientCode}/${d.fileName}`,
      status: d.status,
      uploadedAt: d.uploadedAt.toISOString(),
    })),
    depositAccount:
      user.depositClabe && user.depositBank
        ? {
            beneficiary: user.depositBeneficiary ?? '',
            bank: user.depositBank ?? '',
            accountNumber: user.depositAccountNumber ?? '',
            clabe: user.depositClabe ?? '',
            reference: user.depositReference ?? '',
            updatedAt: user.depositUpdatedAt?.toISOString(),
          }
        : undefined,
    createdAt: user.createdAt.toISOString(),
  };
}

async function nextClientCode(): Promise<string> {
  const last = await prisma.user.findFirst({
    orderBy: { createdAt: 'desc' },
    select: { clientCode: true },
  });
  const match = last?.clientCode.match(/^CLI-(\d+)$/);
  const seq = match ? Number(match[1]) + 1 : 1001;
  return `CLI-${seq}`;
}

async function defaultAdvisorId(): Promise<string | undefined> {
  const advisor = await prisma.staff.findFirst({
    where: { role: 'ADVISOR', active: true },
    select: { id: true },
  });
  return advisor?.id;
}

function userWhere(idOrCode: string): Prisma.UserWhereInput {
  return idOrCode.startsWith('CLI-')
    ? { clientCode: idOrCode }
    : { OR: [{ id: idOrCode }, { clientCode: idOrCode }] };
}

export async function findClient(idOrCode: string): Promise<Client | undefined> {
  if (!isDatabaseEnabled()) return legacy.findClient(idOrCode);

  const user = await prisma.user.findFirst({
    where: userWhere(idOrCode),
    include: userInclude,
  });
  return user ? mapUserToClient(user) : undefined;
}

export async function findClientByPhone(phone: string): Promise<Client | undefined> {
  if (!isDatabaseEnabled()) return legacy.findClientByPhone(phone);

  const digits = phone.replace(/\D/g, '').slice(-10);
  const user = await prisma.user.findFirst({
    where: { phone: digits },
    include: userInclude,
  });
  return user ? mapUserToClient(user) : undefined;
}

export async function findClientByEmail(email: string): Promise<Client | undefined> {
  if (!isDatabaseEnabled()) return legacy.findClientByEmail(email);

  const user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
    include: userInclude,
  });
  return user ? mapUserToClient(user) : undefined;
}

export async function createClient(input: {
  displayName: string;
  email: string;
  phone: string;
  passwordHash: string;
  plainPassword: string;
}): Promise<Client> {
  if (!isDatabaseEnabled()) {
    return legacy.createClient(input);
  }

  const phoneDigits = input.phone.replace(/\D/g, '').slice(-10);
  const clientCode = await nextClientCode();
  const advisorId = await defaultAdvisorId();

  const user = await prisma.user.create({
    data: {
      clientCode,
      email: input.email,
      passwordHash: input.passwordHash,
      plainPassword: input.plainPassword,
      displayName: input.displayName,
      phone: phoneDigits,
      advisorId,
      balance: { create: { cashMxn: 0 } },
    },
    include: userInclude,
  });

  return mapUserToClient(user);
}

export async function listClients(filters?: {
  q?: string;
  status?: string;
  kyc?: string;
}): Promise<Client[]> {
  if (!isDatabaseEnabled()) return legacy.listClients(filters);

  const where: Prisma.UserWhereInput = {};
  if (filters?.status) where.accountStatus = filters.status as AccountStatus;
  if (filters?.kyc) where.kycStatus = filters.kyc as KycStatus;
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    where.OR = [
      { displayName: { contains: q, mode: 'insensitive' } },
      { email: { contains: q, mode: 'insensitive' } },
      { clientCode: { contains: q, mode: 'insensitive' } },
      { phone: { contains: q.replace(/\D/g, '') } },
    ];
  }

  const users = await prisma.user.findMany({
    where,
    include: userInclude,
    orderBy: { createdAt: 'desc' },
  });

  return users.map(mapUserToClient);
}

export async function updateClientBalances(
  idOrCode: string,
  data: { cashMxn?: number; totalInvestedMxn?: number },
): Promise<Client | undefined> {
  if (!isDatabaseEnabled()) return legacy.updateClientBalances(idOrCode, data);

  const user = await prisma.user.findFirst({ where: userWhere(idOrCode) });
  if (!user) return undefined;

  if (data.cashMxn !== undefined) {
    await prisma.balance.upsert({
      where: { userId: user.id },
      create: { userId: user.id, cashMxn: data.cashMxn },
      update: { cashMxn: data.cashMxn },
    });
  }
  if (data.totalInvestedMxn !== undefined) {
    await prisma.user.update({
      where: { id: user.id },
      data: { totalInvestedMxn: data.totalInvestedMxn },
    });
  }

  return findClient(user.clientCode);
}

export async function updateAccountStatus(
  idOrCode: string,
  accountStatus: AccountStatus,
): Promise<Client | undefined> {
  if (!isDatabaseEnabled()) return legacy.updateAccountStatus(idOrCode, accountStatus);

  const user = await prisma.user.findFirst({ where: userWhere(idOrCode) });
  if (!user) return undefined;

  await prisma.user.update({
    where: { id: user.id },
    data: { accountStatus },
  });

  return findClient(user.clientCode);
}

export async function updateDepositAccountFields(
  idOrCode: string,
  data: {
    beneficiary: string;
    bank: string;
    accountNumber: string;
    clabe: string;
    reference: string;
    staffId: string;
  },
): Promise<Client | undefined> {
  if (!isDatabaseEnabled()) return legacy.updateDepositAccountFields(idOrCode, data);

  const user = await prisma.user.findFirst({ where: userWhere(idOrCode) });
  if (!user) return undefined;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      depositBeneficiary: data.beneficiary,
      depositBank: data.bank,
      depositAccountNumber: data.accountNumber,
      depositClabe: data.clabe,
      depositReference: data.reference,
      depositUpdatedAt: new Date(),
      depositUpdatedById: data.staffId,
    },
  });

  return findClient(user.clientCode);
}

export async function getInternalUserId(idOrCode: string): Promise<string | undefined> {
  if (!isDatabaseEnabled()) {
    const client = legacy.findClient(idOrCode);
    return client?.internalId ?? client?.id;
  }

  const user = await prisma.user.findFirst({
    where: userWhere(idOrCode),
    select: { id: true },
  });
  return user?.id;
}

export async function updateClientPassword(
  idOrCode: string,
  passwordHash: string,
  plainPassword: string,
): Promise<Client | undefined> {
  if (!isDatabaseEnabled()) {
    return legacy.updateClientPassword(idOrCode, passwordHash, plainPassword);
  }

  const user = await prisma.user.findFirst({ where: userWhere(idOrCode) });
  if (!user) return undefined;

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash, plainPassword },
  });

  return findClient(user.clientCode);
}
