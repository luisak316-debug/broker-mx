import { randomUUID } from 'node:crypto';
import { hashPassword } from '../services/security.service';
import type {
  AuditLog,
  CashRequest,
  Client,
  ClientTransaction,
  Staff,
} from '../types/admin';
import type { AssetClass } from '../types/market';

/**
 * Almacén en memoria del backoffice con datos de ejemplo. Refleja el modelo de
 * Prisma (schema.prisma) y se sustituiría por repositorios respaldados por la BD.
 *
 * Contraseña de demo para TODO el personal: "Admin1234"
 */

const DEMO_PASSWORD = 'Admin1234';

export const staff: Staff[] = [
  mkStaff('admin@brokermx.com', 'Administración', 'ADMIN'),
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

const FIRST = ['Ana', 'Luis', 'Sofía', 'Diego', 'Valeria', 'Jorge', 'Carmen', 'Roberto', 'Paola', 'Miguel'];
const LAST = ['García', 'Hernández', 'López', 'Martínez', 'Rodríguez', 'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Vázquez'];

export const clients: Client[] = Array.from({ length: 10 }).map((_, i) => {
  const name = `${FIRST[i]} ${LAST[i]}`;
  const cash = Math.round((20000 + Math.random() * 180000) * 100) / 100;
  const invested = Math.round((10000 + Math.random() * 150000) * 100) / 100;
  return {
    id: `CLI-${String(1001 + i)}`,
    email: `${FIRST[i].toLowerCase()}.${LAST[i].toLowerCase()}@correo.com`,
    displayName: name,
    phone: `+52 55 ${1000 + i}${2000 + i}`,
    curp: `XXXX${800101 + i}HDFXXX${i}0`,
    rfc: `XAXX0101${String(10 + i)}AA`,
    kycStatus: i % 4 === 0 ? 'IN_REVIEW' : 'APPROVED',
    accountStatus: i % 7 === 0 ? 'SUSPENDIDA' : 'ACTIVA',
    riskProfile: (['CONSERVADOR', 'MODERADO', 'AGRESIVO'] as const)[i % 3],
    advisorId,
    cashMxn: cash,
    totalInvestedMxn: invested,
    documents: [
      {
        id: randomUUID(),
        type: 'INE',
        fileName: `ine_${i}.pdf`,
        mimeType: 'application/pdf',
        fileUrl: `/uploads/clients/CLI-${1001 + i}/demo-ine.pdf`,
        status: 'VALIDADO',
        uploadedAt: daysAgo(40 + i),
        uploadedByName: 'Juan Pérez',
      },
      {
        id: randomUUID(),
        type: 'COMPROBANTE_DOMICILIO',
        fileName: `domicilio_${i}.pdf`,
        mimeType: 'application/pdf',
        fileUrl: `/uploads/clients/CLI-${1001 + i}/demo-domicilio.pdf`,
        status: i % 4 === 0 ? 'EN_REVISION' : 'VALIDADO',
        uploadedAt: daysAgo(38 + i),
        uploadedByName: 'Juan Pérez',
      },
    ],
    // El primer cliente trae una cuenta de depósito ya asignada (demo).
    depositAccount:
      i === 0
        ? {
            beneficiary: 'Corporativo Consorcio Óptimo Andrade Estrella S.A.S. de C.V.',
            bank: 'BBVA',
            accountNumber: '0123456789',
            clabe: '012180001234567895',
            reference: `INV-${1001 + i}`,
            initialInvestmentMxn: 50000,
            updatedAt: daysAgo(5),
            updatedByName: 'Juan Pérez',
          }
        : undefined,
    createdAt: daysAgo(60 + i * 3),
  };
});

const CATEGORIES: AssetClass[] = ['stock', 'commodity', 'forex', 'crypto'];
const SYMBOLS: Record<AssetClass, string[]> = {
  stock: ['AAPL', 'MSFT', 'AMXB.MX', 'NVDA'],
  commodity: ['XAU', 'BRENT', 'KC'],
  forex: ['USD/MXN', 'EUR/MXN'],
  crypto: ['BTC', 'ETH', 'SOL'],
};

export const transactions: ClientTransaction[] = clients.flatMap((c) =>
  Array.from({ length: 6 }).map(() => {
    const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    const syms = SYMBOLS[category];
    return {
      id: randomUUID(),
      userId: c.id,
      category,
      symbol: syms[Math.floor(Math.random() * syms.length)],
      side: Math.random() > 0.5 ? 'buy' : 'sell',
      direction: Math.random() > 0.3 ? 'long' : 'short',
      quantity: Math.round(Math.random() * 100) / 10 + 1,
      price: Math.round(Math.random() * 5000 * 100) / 100,
      amountMxn: Math.round(Math.random() * 50000 * 100) / 100,
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    } as ClientTransaction;
  }),
);

export const cashRequests: CashRequest[] = clients.slice(0, 6).map((c, i) => ({
  id: randomUUID(),
  userId: c.id,
  clientName: c.displayName,
  type: i % 2 === 0 ? 'DEPOSITO' : 'RETIRO',
  amountMxn: Math.round((5000 + Math.random() * 45000) * 100) / 100,
  method: i % 2 === 0 ? 'SPEI' : 'Transferencia bancaria',
  status: 'PENDIENTE',
  createdAt: daysAgo(Math.floor(Math.random() * 5)),
}));

export const auditLogs: AuditLog[] = [];

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString();
}

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
}): Client {
  const phoneDigits = input.phone.replace(/\D/g, '').slice(-10);
  const client: Client = {
    id: `CLI-${nextClientSeq++}`,
    email: input.email,
    passwordHash: input.passwordHash,
    displayName: input.displayName,
    phone: phoneDigits,
    kycStatus: 'PENDING',
    accountStatus: 'ACTIVA',
    riskProfile: 'MODERADO',
    advisorId, // asignado al asesor por defecto (Juan Pérez)
    cashMxn: 0,
    totalInvestedMxn: 0,
    documents: [],
    depositAccount: undefined, // campos bancarios vacíos para el asesor
    createdAt: new Date().toISOString(),
  };
  clients.push(client);
  return client;
}
