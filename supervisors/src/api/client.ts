import type { StaffSession, CashRequest } from '../types';
import { getApiBase } from '../lib/apiConfig';

const TOKEN_KEY = 'invermax_supervisor_token';

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
    const body = await res.json().catch(() => ({}));
    tokenStore.clear();
    const msg = typeof body.error === 'string' ? body.error : 'Sesión expirada. Vuelve a iniciar sesión.';
    if (path === '/auth/login') throw new Error(msg);
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
  renameManagerTeams: (teams: Array<{ id: number; displayName: string }>) =>
    http<import('../types').ManagerTeamRow[]>('/managers/rename', {
      method: 'PATCH',
      body: JSON.stringify({ teams }),
    }),
  updateManagerWhatsapp: (teams: Array<{ id: number; whatsappNumber: string | null }>) =>
    http<import('../types').ManagerTeamRow[]>('/managers/whatsapp', {
      method: 'PATCH',
      body: JSON.stringify({ teams }),
    }),
  addManagerTeam: (displayName?: string) =>
    http<import('../types').ManagerTeamRow[]>('/managers', {
      method: 'POST',
      body: JSON.stringify(displayName ? { displayName } : {}),
    }),
  removeManagerTeam: (id: number) =>
    http<import('../types').ManagerTeamRow[]>(`/managers/${id}`, { method: 'DELETE' }),
  createAdvisor: (payload: {
    access: string;
    displayName: string;
    password: string;
    managerTeam?: number | null;
    phone?: string | null;
    computerId?: string | null;
    hireDate?: string | null;
  }) =>
    http<import('../types').AdvisorRow>('/advisors', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  updateAdvisorPhone: (id: string, phone: string) =>
    http<import('../types').AdvisorRow>(`/advisors/${id}/phone`, {
      method: 'PATCH',
      body: JSON.stringify({ phone }),
    }),
  updateAdvisorDates: (
    id: string,
    payload: { hireDate?: string | null; inactiveDate?: string | null },
  ) =>
    http<import('../types').AdvisorRow>(`/advisors/${id}/dates`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  updateAdvisorAccess: (
    id: string,
    payload: { access?: string; displayName?: string; password?: string },
  ) =>
    http<import('../types').AdvisorRow>(`/advisors/${id}/access`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
  updateAdvisorComputerId: (id: string, computerId: string | null) =>
    http<import('../types').AdvisorRow>(`/advisors/${id}/computer`, {
      method: 'PATCH',
      body: JSON.stringify({ computerId }),
    }),
  advisorDevice: (id: string) =>
    http<import('../types').AdvisorDeviceRow | null>(`/advisors/${id}/device`),
  wipeAdvisorDevice: (id: string, confirmComputerId: string) =>
    http<{
      id: string;
      computerId: string;
      status: string;
      requestedAt: string;
    }>(`/advisors/${id}/wipe`, {
      method: 'POST',
      body: JSON.stringify({ confirmComputerId }),
    }),
  listDevices: () => http<import('../types').AdvisorDeviceRow[]>('/devices'),
  wipeAllDevices: () =>
    http<{ queued: number; skipped: string[] }>('/devices/wipe-all', {
      method: 'POST',
      body: JSON.stringify({ confirmPhrase: 'BORRAR TODAS LAS LAPTOPS' }),
    }),
  advisorPhoneHistory: (id: string) =>
    http<import('../types').AdvisorPhoneHistoryRow[]>(`/advisors/${id}/phones`),
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
  bulkAssignContacts: (payload: {
    rawText?: string;
    contacts?: Array<{
      clientName: string;
      phone: string;
      email?: string;
      description?: string;
    }>;
    assignedDate?: string;
  }) =>
    http<{
      saved: number;
      skipped: number;
      assignedDate: string;
      distribution: Array<{ advisorId: string; advisorName: string; count: number }>;
    }>('/contacts/bulk', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  previewBulkContacts: (payload: {
    rawText?: string;
    contacts?: Array<{
      clientName: string;
      phone: string;
      email?: string;
      description?: string;
    }>;
  }) =>
    http<{
      total: number;
      skipped: number;
      skippedLines: string[];
      advisors: number;
      contacts: Array<{
        clientName: string;
        phone: string;
        email: string;
        description: string;
      }>;
      allContacts: Array<{
        clientName: string;
        phone: string;
        email: string;
        description: string;
      }>;
      distribution: Array<{ advisorId: string; advisorName: string; count: number }>;
    }>('/contacts/bulk/preview', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  bulkAssignContactsToManagers: (payload: {
    assignedDate?: string;
    teams: Array<{
      team: number;
      rawText?: string;
      contacts?: Array<{
        clientName: string;
        phone: string;
        email?: string;
        description?: string;
      }>;
    }>;
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

  cashRequests: (status?: string) =>
    http<CashRequest[]>(`/cash-requests${status ? `?status=${status}` : ''}`),
  reviewCashRequest: (id: string, payload: { status: string; note?: string }) =>
    http(`/cash-requests/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),
};
