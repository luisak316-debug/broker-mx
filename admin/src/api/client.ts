import type {
  AuditLog,
  CashRequest,
  ClientProfile,
  ClientRow,
  DashboardMetrics,
  DepositAccount,
  StaffSession,
  Transaction,
} from '../types';

import { getApiBase } from '../lib/apiConfig';

const TOKEN_KEY = 'brokermx_admin_token';

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
  if (res.status === 405) {
    throw new Error(
      'La API no esta conectada. En Vercel agrega VITE_API_URL con la URL del backend y vuelve a publicar.',
    );
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
  metrics: () => http<DashboardMetrics>('/metrics'),

  clients: (params?: { q?: string; status?: string; kyc?: string }) => {
    const qs = new URLSearchParams();
    if (params?.q) qs.set('q', params.q);
    if (params?.status) qs.set('status', params.status);
    if (params?.kyc) qs.set('kyc', params.kyc);
    return http<ClientRow[]>(`/clients?${qs.toString()}`);
  },
  client: (id: string) => http<ClientProfile>(`/clients/${id}`),

  updateClientAccess: (
    id: string,
    payload: { accountStatus: 'ACTIVA' | 'SUSPENDIDA' | 'BLOQUEADA' | 'CERRADA'; reason: string },
  ) => http(`/clients/${id}/access`, { method: 'PATCH', body: JSON.stringify(payload) }),

  updateBalance: (
    id: string,
    payload: { cashMxn?: number; totalInvestedMxn?: number; reason: string },
  ) => http(`/clients/${id}/balance`, { method: 'PATCH', body: JSON.stringify(payload) }),

  adjustFunds: (
    id: string,
    payload: { operation: 'add' | 'remove'; amountMxn: number; reason: string },
  ) => http(`/clients/${id}/funds`, { method: 'POST', body: JSON.stringify(payload) }),

  grantBonus: (
    id: string,
    payload: {
      bonusType: 'DEPOSITO' | 'FIJO' | 'SALDO' | 'INVERTIDO';
      amountMxn?: number;
      percentage?: number;
      reason: string;
    },
  ) =>
    http<{
      client: ClientProfile;
      bonus: {
        bonusType: string;
        typeLabel: string;
        amountMxn: number;
        percentage: number;
        percentPartMxn: number;
        baseMxn: number;
        totalMxn: number;
      };
    }>(`/clients/${id}/bonus`, { method: 'POST', body: JSON.stringify(payload) }),

  updateDepositAccount: (id: string, payload: Omit<DepositAccount, 'updatedAt' | 'updatedByName'>) =>
    http<{ depositAccount: DepositAccount }>(`/clients/${id}/deposit-account`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  transactions: (params?: { userId?: string; category?: string }) => {
    const qs = new URLSearchParams();
    if (params?.userId) qs.set('userId', params.userId);
    if (params?.category) qs.set('category', params.category);
    return http<Transaction[]>(`/transactions?${qs.toString()}`);
  },

  cashRequests: (status?: string) =>
    http<CashRequest[]>(`/cash-requests${status ? `?status=${status}` : ''}`),
  reviewCashRequest: (id: string, payload: { status: string; note?: string }) =>
    http(`/cash-requests/${id}`, { method: 'PATCH', body: JSON.stringify(payload) }),

  audit: (params?: { staffId?: string; clientId?: string }) => {
    const qs = new URLSearchParams();
    if (params?.staffId) qs.set('staffId', params.staffId);
    if (params?.clientId) qs.set('clientId', params.clientId);
    return http<AuditLog[]>(`/audit?${qs.toString()}`);
  },
};
