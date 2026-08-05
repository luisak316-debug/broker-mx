export type StaffRole = 'ADVISOR';

export interface StaffSession {
  id: string;
  access: string;
  displayName: string;
  role: StaffRole;
  managerTeam?: number | null;
  managerTeamName?: string | null;
  lastLoginAt?: string;
}

export interface AssignedContact {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  description: string;
  assignedDate: string;
  assignedByName?: string;
  createdAt?: string;
}

export interface ContactHistoryContact extends AssignedContact {
  assignedByName: string;
  createdAt: string;
}

export interface ContactHistoryResponse {
  contacts: ContactHistoryContact[];
  total: number;
}
