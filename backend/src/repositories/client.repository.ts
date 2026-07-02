import type { Prisma } from '@prisma/client';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { isDatabaseEnabled } from '../lib/database';
import * as legacy from '../data/adminStore';
import { prisma } from '../lib/prisma';
import type { AccountStatus, Client, ClientDocument, DepositMethod, KycStatus } from '../types/admin';

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

function profilePhotoApiPath(clientCode: string): string {
  return `/api/profile/${clientCode}/photo`;
}

function resolveProfilePhotoUrl(user: {
  clientCode: string;
  profilePhotoUrl?: string | null;
  profilePhotoData?: string | null;
  profilePhotoUpdatedAt?: Date | null;
  updatedAt?: Date;
}): string | undefined {
  if (!user.profilePhotoData && !user.profilePhotoUrl) return undefined;
  const v =
    user.profilePhotoUpdatedAt?.getTime() ??
    user.updatedAt?.getTime() ??
    0;
  return `${profilePhotoApiPath(user.clientCode)}?v=${v}`;
}

function buildDepositAccount(user: DbUser): Client['depositAccount'] {
  if (!user.depositBank || !user.depositBeneficiary || !user.depositReference) return undefined;

  const method: DepositMethod =
    user.depositMethod === 'VENTANILLA'
      ? 'VENTANILLA'
      : user.depositMethod === 'TRANSFERENCIA'
        ? 'TRANSFERENCIA'
        : user.depositClabe
          ? 'TRANSFERENCIA'
          : user.depositAccountNumber
            ? 'VENTANILLA'
            : 'TRANSFERENCIA';

  if (method === 'TRANSFERENCIA' && !user.depositClabe) return undefined;
  if (method === 'VENTANILLA' && !user.depositAccountNumber) return undefined;

  return {
    depositMethod: method,
    beneficiary: user.depositBeneficiary,
    bank: user.depositBank,
    accountNumber: user.depositAccountNumber ?? '',
    clabe: user.depositClabe ?? '',
    reference: user.depositReference,
    updatedAt: user.depositUpdatedAt?.toISOString(),
  };
}

function guessDocumentMime(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  if (/\.jpe?g$/.test(lower)) return 'image/jpeg';
  if (lower.endsWith('.pdf')) return 'application/pdf';
  return 'application/octet-stream';
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
    profilePhotoUrl: resolveProfilePhotoUrl(user),
    profilePhotoData: user.profilePhotoData ?? undefined,
    curp: user.curp ?? undefined,
    rfc: user.rfc ?? undefined,
    city: user.city ?? undefined,
    homeAddress: user.homeAddress ?? undefined,
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
      mimeType: d.mimeType ?? guessDocumentMime(d.fileName),
      fileUrl: `/api/profile/${user.clientCode}/documents/${d.id}/file`,
      status: d.status,
      uploadedAt: d.uploadedAt.toISOString(),
    })),
    depositAccount: buildDepositAccount(user),
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
    depositMethod: DepositMethod;
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
      depositMethod: data.depositMethod,
      depositBeneficiary: data.beneficiary,
      depositBank: data.bank,
      depositAccountNumber: data.depositMethod === 'VENTANILLA' ? data.accountNumber : data.accountNumber || null,
      depositClabe: data.depositMethod === 'TRANSFERENCIA' ? data.clabe : null,
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

export async function updateClientProfilePhoto(
  idOrCode: string,
  profilePhotoData: string,
): Promise<Client | undefined> {
  if (!isDatabaseEnabled()) {
    return legacy.updateClientProfilePhoto(idOrCode, profilePhotoData);
  }

  const user = await prisma.user.findFirst({ where: userWhere(idOrCode) });
  if (!user) return undefined;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      profilePhotoData,
      profilePhotoUrl: profilePhotoApiPath(user.clientCode),
      profilePhotoUpdatedAt: new Date(),
    },
  });

  return findClient(user.clientCode);
}

export async function updateClientProfileDetails(
  idOrCode: string,
  data: { city?: string | null; homeAddress?: string | null },
): Promise<Client | undefined> {
  if (!isDatabaseEnabled()) {
    return legacy.updateClientProfileDetails(idOrCode, data);
  }

  const user = await prisma.user.findFirst({ where: userWhere(idOrCode) });
  if (!user) return undefined;

  const patch: Prisma.UserUpdateInput = {};
  if (data.city !== undefined) patch.city = data.city || null;
  if (data.homeAddress !== undefined) patch.homeAddress = data.homeAddress || null;

  await prisma.user.update({
    where: { id: user.id },
    data: patch,
  });

  return findClient(user.clientCode);
}

export async function getProfilePhotoBuffer(idOrCode: string): Promise<Buffer | undefined> {
  if (!isDatabaseEnabled()) {
    const client = legacy.findClient(idOrCode);
    if (!client) return undefined;
    if (client.profilePhotoData) {
      return Buffer.from(client.profilePhotoData, 'base64');
    }
    if (client.profilePhotoUrl?.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), client.profilePhotoUrl.replace(/^\//, ''));
      if (existsSync(filePath)) return readFileSync(filePath);
    }
    return undefined;
  }

  const user = await prisma.user.findFirst({
    where: userWhere(idOrCode),
    select: { profilePhotoData: true, profilePhotoUrl: true },
  });
  if (!user) return undefined;

  if (user.profilePhotoData) {
    return Buffer.from(user.profilePhotoData, 'base64');
  }

  if (user.profilePhotoUrl?.startsWith('/uploads/')) {
    const filePath = path.join(process.cwd(), user.profilePhotoUrl.replace(/^\//, ''));
    if (existsSync(filePath)) return readFileSync(filePath);
  }

  return undefined;
}

export async function getClientDocumentFile(
  clientIdOrCode: string,
  documentId: string,
): Promise<{ buffer: Buffer; mimeType: string; fileName: string } | undefined> {
  if (!isDatabaseEnabled()) {
    const client = legacy.findClient(clientIdOrCode);
    const doc = client?.documents.find((d) => d.id === documentId);
    if (!doc) return undefined;
    const fileData = (doc as ClientDocument & { fileData?: string }).fileData;
    if (fileData) {
      return {
        buffer: Buffer.from(fileData, 'base64'),
        mimeType: doc.mimeType,
        fileName: doc.fileName,
      };
    }
    if (doc.fileUrl.startsWith('/uploads/')) {
      const filePath = path.join(process.cwd(), doc.fileUrl.replace(/^\//, ''));
      if (existsSync(filePath)) {
        return {
          buffer: readFileSync(filePath),
          mimeType: doc.mimeType,
          fileName: doc.fileName,
        };
      }
    }
    return undefined;
  }

  const row = await prisma.clientDocument.findFirst({
    where: {
      id: documentId,
      user: userWhere(clientIdOrCode),
    },
    select: { fileName: true, mimeType: true, fileData: true },
  });
  if (!row?.fileData) return undefined;

  return {
    buffer: Buffer.from(row.fileData, 'base64'),
    mimeType: row.mimeType ?? guessDocumentMime(row.fileName),
    fileName: row.fileName,
  };
}
