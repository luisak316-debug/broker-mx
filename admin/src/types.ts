export type StaffRole = 'ADMIN' | 'ADVISOR' | 'COMPLIANCE' | 'SUPPORT';

export interface StaffSession {
  id: string;
  email: string;
  displayName: string;
  role: StaffRole;
}

export interface ClientRow {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  kycStatus: string;
  accountStatus: string;
  riskProfile: string;
  cashMxn: number;
  totalInvestedMxn: number;
  advisorName?: string;
  createdAt: string;
}

export interface ClientDocument {
  id: string;
  type: string;
  fileName: string;
  mimeType: string;
  fileUrl: string;
  status: string;
  uploadedAt: string;
  uploadedByName?: string;
}

export interface DepositAccount {
  beneficiary: string;
  bank: string;
  accountNumber: string;
  clabe: string;
  reference: string;
  initialInvestmentMxn?: number;
  updatedAt?: string;
  updatedByName?: string;
}

export interface ClientProfile extends ClientRow {
  curp?: string;
  rfc?: string;
  documents: ClientDocument[];
  advisorEmail?: string;
  depositAccount?: DepositAccount;
}

export interface Transaction {
  id: string;
  userId: string;
  clientName?: string;
  category: 'stock' | 'commodity' | 'forex' | 'crypto';
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
  type: 'DEPOSITO' | 'RETIRO';
  amountMxn: number;
  method?: string;
  status: 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';
  note?: string;
  reviewedByName?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  staffName: string;
  action: string;
  targetUserName?: string;
  description: string;
  before?: unknown;
  after?: unknown;
  ipAddress?: string;
  createdAt: string;
}

export interface DashboardMetrics {
  totalClients: number;
  totalCash: number;
  totalInvested: number;
  pendingRequests: number;
  depositsToday: number;
  advisors: Array<{ advisorId: string; name: string; clients: number; aumMxn: number }>;
  byCategory: Array<{ category: string; volumeMxn: number; count: number }>;
}
