import { randomUUID } from 'node:crypto';
import { hashPassword } from '../services/security.service';
import { env } from '../config/env';
import { loadLegacyPersist, saveLegacyPersist } from '../lib/filePersist';
import type {
  AuditLog,
  CashRequest,
  Client,
  ClientTransaction,
  DepositMethod,
  Staff,
} from '../types/admin';

/**
 * Almacén legacy (archivo local) cuando no hay PostgreSQL.
 * Contraseña de demo para TODO el personal: "Admin1234"
 */

const DEMO_PASSWORD = 'Admin1234';

export const staff: Staff[] = [
  mkStaff('admin@brokermx.com', 'Administración', 'ADMIN'),
  mkStaff('supervisor@brokermx.com', 'María Supervisora', 'SUPERVISOR'),
  mkStaff('juan.perez@brokermx.com', 'Juan Pérez', 'ADVISOR'),
  mkStaff('laura.cumplimiento@brokermx.com', 'Laura Cumplimiento', 'COMPLIANCE'),
  mkStaff('soporte@brokermx.com', 'Carlos Soporte', 'SUPPORT'),
];

/** Nombre visible del administrador principal. */
export function normalizeStaffDisplay(staff: Staff): Staff {
  if (staff.email === 'admin@brokermx.com') staff.displayName = 'Administración';
  return staff;
}

staff.forEach(normalizeStaffDisplay);

function mkStaff(email: string, displayName: string, role: Staff['role']): Staff {
  return {
    id: randomUUID(),
    email,
    displayName,
    role,
    active: true,
    passwordHash: hashPassword(DEMO_PASSWORD),
    createdAt: new Date().toISOString(),
  };
}

const advisorId = staff[1].id; // Juan Pérez

/** Solo clientes registrados en la app — sin datos ficticios. */
export const clients: Client[] = [];

export const transactions: ClientTransaction[] = [];

export const cashRequests: CashRequest[] = [];

export const auditLogs: AuditLog[] = [];

export function findStaffByEmail(email: string): Staff | undefined {
  return staff.find((s) => s.email.toLowerCase() === email.toLowerCase());
}
export function findStaffById(id: string): Staff | undefined {
  return staff.find((s) => s.id === id);
}
export function findClient(id: string): Client | undefined {
  return clients.find((c) => c.id === id);
}
export function findClientByEmail(email: string): Client | undefined {
  return clients.find((c) => c.email.toLowerCase() === email.toLowerCase());
}
export function findClientByPhone(phone: string): Client | undefined {
  const digits = phone.replace(/\D/g, '').slice(-10);
  return clients.find((c) => (c.phone ?? '').replace(/\D/g, '').slice(-10) === digits);
}

let nextClientSeq = 1001 + clients.length;

function persistSnapshot(): void {
  saveLegacyPersist({
    clients,
    cashRequests,
    auditLogs,
    nextClientSeq,
    savedAt: new Date().toISOString(),
  });
}

/** Carga clientes reales desde disco cuando no hay PostgreSQL. */
export function initLegacyStore(): void {
  const saved = loadLegacyPersist();
  if (saved) {
    clients.length = 0;
    clients.push(...saved.clients);
    cashRequests.length = 0;
    cashRequests.push(...saved.cashRequests);
    auditLogs.length = 0;
    auditLogs.push(...saved.auditLogs);
    nextClientSeq = saved.nextClientSeq;
  } else if (env.isProd) {
    clients.length = 0;
    cashRequests.length = 0;
    auditLogs.length = 0;
    nextClientSeq = 1001;
  }
}

export function recomputeClientSequence(): void {
  let max = 1000;
  for (const c of clients) {
    const match = c.id.match(/^CLI-(\d+)$/);
    if (match) max = Math.max(max, Number(match[1]));
  }
  nextClientSeq = max + 1;
}

export function persistAfterPurge(): void {
  persistSnapshot();
}

export function listClients(filters?: {
  q?: string;
  status?: string;
  kyc?: string;
}): Client[] {
  let rows = [...clients];
  if (filters?.status) rows = rows.filter((c) => c.accountStatus === filters.status);
  if (filters?.kyc) rows = rows.filter((c) => c.kycStatus === filters.kyc);
  if (filters?.q) {
    const q = filters.q.toLowerCase();
    rows = rows.filter(
      (c) =>
        c.displayName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.phone ?? '').includes(q.replace(/\D/g, '')),
    );
  }
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function updateClientBalances(
  idOrCode: string,
  data: { cashMxn?: number; totalInvestedMxn?: number },
): Client | undefined {
  const client = findClient(idOrCode);
  if (!client) return undefined;
  if (data.cashMxn !== undefined) client.cashMxn = data.cashMxn;
  if (data.totalInvestedMxn !== undefined) client.totalInvestedMxn = data.totalInvestedMxn;
  persistSnapshot();
  return client;
}

export function updateAccountStatus(
  idOrCode: string,
  accountStatus: Client['accountStatus'],
): Client | undefined {
  const client = findClient(idOrCode);
  if (!client) return undefined;
  client.accountStatus = accountStatus;
  persistSnapshot();
  return client;
}

export function updateDepositAccountFields(
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
): Client | undefined {
  const client = findClient(idOrCode);
  if (!client) return undefined;
  const staffMember = findStaffById(data.staffId);
  client.depositAccount = {
    depositMethod: data.depositMethod,
    beneficiary: data.beneficiary,
    bank: data.bank,
    accountNumber: data.depositMethod === 'VENTANILLA' ? data.accountNumber : data.accountNumber || '',
    clabe: data.depositMethod === 'TRANSFERENCIA' ? data.clabe : '',
    reference: data.reference,
    updatedAt: new Date().toISOString(),
    updatedByName: staffMember?.displayName ?? 'Asesor',
  };
  persistSnapshot();
  return client;
}

export function touchStaffLogin(id: string): void {
  const member = findStaffById(id);
  if (member) member.lastLoginAt = new Date().toISOString();
}

export function appendCashRequest(request: CashRequest): CashRequest {
  cashRequests.unshift(request);
  const client = findClient(request.userId);
  if (client) client.lastWithdrawalRequestAt = request.createdAt;
  persistSnapshot();
  return request;
}

export function reviewLegacyCashRequest(
  id: string,
  data: { status: CashRequest['status']; note?: string; reviewedByName: string },
): CashRequest | undefined {
  const request = cashRequests.find((r) => r.id === id);
  if (!request) return undefined;
  request.status = data.status;
  request.note = data.note;
  request.reviewedByName = data.reviewedByName;
  request.reviewedAt = new Date().toISOString();
  persistSnapshot();
  return request;
}

export function appendAuditLog(entry: AuditLog): AuditLog {
  auditLogs.unshift(entry);
  persistSnapshot();
  return entry;
}

export function addClientDocument(
  idOrCode: string,
  doc: Client['documents'][number],
): Client | undefined {
  const client = findClient(idOrCode);
  if (!client) return undefined;
  client.documents.push(doc);
  if (client.kycStatus === 'PENDING') client.kycStatus = 'IN_REVIEW';
  persistSnapshot();
  return client;
}

/**
 * Crea el perfil de un nuevo cliente (prospecto) registrado desde la landing.
 * Los campos bancarios quedan vacíos, listos para que el asesor los asigne en
 * el panel de administración.
 */
export function createClient(input: {
  displayName: string;
  email: string;
  phone: string;
  passwordHash: string;
  plainPassword?: string;
}): Client {
  const phoneDigits = input.phone.replace(/\D/g, '').slice(-10);
  const id = `CLI-${nextClientSeq++}`;
  const client: Client = {
    id,
    internalId: id,
    email: input.email,
    passwordHash: input.passwordHash,
    plainPassword: input.plainPassword,
    displayName: input.displayName,
    phone: phoneDigits,
    kycStatus: 'PENDING',
    accountStatus: 'ACTIVA',
    riskProfile: 'MODERADO',
    advisorId,
    cashMxn: 0,
    totalInvestedMxn: 0,
    documents: [],
    depositAccount: undefined,
    createdAt: new Date().toISOString(),
  };
  clients.push(client);
  persistSnapshot();
  return client;
}

export function updateClientPassword(
  idOrCode: string,
  passwordHash: string,
  plainPassword: string,
): Client | undefined {
  const client = findClient(idOrCode);
  if (!client) return undefined;
  client.passwordHash = passwordHash;
  client.plainPassword = plainPassword;
  persistSnapshot();
  return client;
}

export function updateClientProfilePhoto(
  idOrCode: string,
  profilePhotoData: string,
): Client | undefined {
  const client = findClient(idOrCode);
  if (!client) return undefined;
  client.profilePhotoData = profilePhotoData;
  client.profilePhotoUrl = `/api/profile/${client.id}/photo`;
  persistSnapshot();
  return client;
}
