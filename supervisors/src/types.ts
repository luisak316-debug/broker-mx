export type StaffRole = 'ADMIN' | 'SUPERVISOR';

export interface StaffSession {
  id: string;
  email: string;
  displayName: string;
  role: StaffRole;
}

export interface ClientSummary {
  id: string;
  displayName: string;
  email: string;
  phone?: string;
  totalInvestedMxn: number;
  cashMxn: number;
  advisorName?: string;
  accountStatus: string;
  createdAt: string;
}

export interface AdvisorRow {
  id: string;
  email: string;
  displayName: string;
  managerTeam?: number | null;
  phone?: string | null;
  hireDate?: string | null;
  inactiveDate?: string | null;
  lastLoginAt?: string;
  createdAt: string;
}

export interface AdvisorPhoneHistoryRow {
  id: string;
  phone: string;
  replacedAt: string;
  replacedByName?: string;
}

export interface ManagerTeamRow {
  team: number;
  displayName: string;
  managerId?: string;
  advisorCount: number;
}

export interface ContactRow {
  id: string;
  advisorId: string;
  advisorName: string;
  clientName: string;
  phone: string;
  email: string;
  description: string;
  assignedDate: string;
  createdAt: string;
}
