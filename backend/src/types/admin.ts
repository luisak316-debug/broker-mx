import type { AssetClass } from './market';

export type StaffRole = 'ADMIN' | 'ADVISOR' | 'COMPLIANCE' | 'SUPPORT';
export type AccountStatus = 'ACTIVA' | 'SUSPENDIDA' | 'BLOQUEADA' | 'CERRADA';
export type KycStatus = 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED';
export type DocumentType = 'INE' | 'PASAPORTE' | 'COMPROBANTE_DOMICILIO' | 'CONSTANCIA_FISCAL';
export type DocumentStatus = 'EN_REVISION' | 'VALIDADO' | 'RECHAZADO';
export type CashRequestType = 'DEPOSITO' | 'RETIRO';
export type RequestStatus = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

export interface Staff {
  id: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: StaffRole;
  active: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export type StaffPublic = Omit<Staff, 'passwordHash'>;

export interface ClientDocument {
  id: string;
  type: DocumentType;
  fileName: string;
  mimeType: string;
  fileUrl: string;
  status: DocumentStatus;
  uploadedAt: string;
  uploadedByName?: string;
}

/** Cuenta bancaria de depósito personalizada y reemplazable por cliente. */
export interface DepositAccount {
  beneficiary: string; // Razón social / beneficiario
  bank: string; // Banco receptor
  accountNumber: string; // Número de cuenta
  clabe: string; // CLABE interbancaria (18 dígitos)
  reference: string; // Referencia única de pago
  initialInvestmentMxn?: number; // Monto inicial de inversión sugerido (opcional)
  updatedAt?: string;
  updatedByName?: string;
}

export interface Client {
  id: string;
  /** ID interno (cuid) — no mostrar al cliente. */
  internalId?: string;
  email: string;
  passwordHash?: string;
  plainPassword?: string;
  displayName: string;
  phone?: string;
  curp?: string;
  rfc?: string;
  kycStatus: KycStatus;
  accountStatus: AccountStatus;
  riskProfile: 'CONSERVADOR' | 'MODERADO' | 'AGRESIVO';
  advisorId?: string;
  cashMxn: number;
  totalInvestedMxn: number;
  lastWithdrawalRequestAt?: string;
  documents: ClientDocument[];
  depositAccount?: DepositAccount;
  createdAt: string;
}

export interface ClientTransaction {
  id: string;
  userId: string;
  category: AssetClass;
  symbol: string;
  side: 'buy' | 'sell';
  direction: 'long' | 'short';
  quantity: number;
  price: number;
  amountMxn: number;
  createdAt: string;
}

export interface CashRequest {
  id: string;
  userId: string;
  clientName: string;
  type: CashRequestType;
  amountMxn: number;
  method?: string;
  status: RequestStatus;
  note?: string;
  reviewedById?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  staffId: string;
  staffName: string;
  action: string;
  targetUserId?: string;
  targetUserName?: string;
  description: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  createdAt: string;
}
