export type StaffRole = 'ADVISOR';

export interface StaffSession {
  id: string;
  email: string;
  displayName: string;
  role: StaffRole;
  managerTeam?: number | null;
  lastLoginAt?: string;
}

export interface AssignedContact {
  id: string;
  clientName: string;
  phone: string;
  email: string;
  description: string;
  assignedDate: string;
}
