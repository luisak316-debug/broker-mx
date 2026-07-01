import type { StaffSession } from '../types';
import { getApiBase } from '../lib/apiConfig';

const TOKEN_KEY = 'brokermx_supervisor_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const token = tokenStore.get();
  const res = await fetch(`${getApiBase()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (res.status === 401) {
    tokenStore.clear();
    throw new Error('Sesión expirada. Vuelve a iniciar sesión.');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Error ${res.status}`);
  }
  const json = (await res.json()) as { data: T };
  return json.data;
}

export const api = {
  login: (email: string, password: string) =>
    http<{ token: string; staff: StaffSession }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  me: () => http<StaffSession>('/auth/me'),
  clients: (q?: string) => {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    return http<import('../types').ClientSummary[]>(`/clients${qs}`);
  },
  advisors: () => http<import('../types').AdvisorRow[]>('/advisors'),
  managers: () => http<import('../types').ManagerTeamRow[]>('/managers'),
  createAdvisor: (payload: {
    email: string;
    displayName: string;
    password: string;
    managerTeam?: number | null;
  }) =>
    http<{ id: string; email: string; displayName: string }>('/advisors', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  removeAdvisor: (id: string) =>
    http<{ ok: boolean }>(`/advisors/${id}`, { method: 'DELETE' }),
  contacts: (params: {
    advisorId?: string;
    year?: number;
    month?: number;
    day?: number;
  }) => {
    const qs = new URLSearchParams();
    if (params.advisorId) qs.set('advisorId', params.advisorId);
    if (params.year) qs.set('year', String(params.year));
    if (params.month) qs.set('month', String(params.month));
    if (params.day) qs.set('day', String(params.day));
    return http<import('../types').ContactRow[]>(`/contacts?${qs.toString()}`);
  },
  saveContact: (payload: {
    advisorId: string;
    clientName: string;
    phone: string;
    email?: string;
    description?: string;
    assignedDate?: string;
  }) =>
    http<import('../types').ContactRow>('/contacts', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  bulkAssignContacts: (payload: { rawText: string; assignedDate?: string }) =>
    http<{
      saved: number;
      skipped: number;
      assignedDate: string;
      distribution: Array<{ advisorId: string; advisorName: string; count: number }>;
    }>('/contacts/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  bulkAssignContactsToManagers: (payload: {
    assignedDate?: string;
    teams: Array<{ team: number; rawText: string }>;
  }) =>
    http<{
      saved: number;
      skipped: number;
      assignedDate: string;
      teams: Array<{
        team: number;
        saved: number;
        skipped: number;
        advisorCount: number;
        warning?: string;
        distribution: Array<{ advisorId: string; advisorName: string; count: number }>;
      }>;
    }>('/contacts/bulk/managers', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  removeContact: (id: string) =>
    http<{ ok: boolean }>(`/contacts/${id}`, { method: 'DELETE' }),
};
