import type { AssignedContact, ContactHistoryResponse, StaffSession } from '../types';
import { getApiBase } from '../lib/apiConfig';
import { advisorInternalEmail } from '../lib/advisorAccess';

const TOKEN_KEY = 'invermax_advisor_token';

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
  login: (access: string, password: string) => {
    const normalized = access.replace(/\s+/g, '').trim();
    const email = advisorInternalEmail(normalized);
    return http<{ token: string; staff: StaffSession }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ access: normalized, email, password }),
    });
  },
  me: () => http<StaffSession>('/auth/me'),
  myContacts: (params?: { year?: number; month?: number; day?: number }) => {
    const qs = new URLSearchParams();
    if (params?.year) qs.set('year', String(params.year));
    if (params?.month) qs.set('month', String(params.month));
    if (params?.day) qs.set('day', String(params.day));
    return http<AssignedContact[]>(`/my-contacts?${qs.toString()}`);
  },
  myContactHistory: (params?: { year?: number; from?: string; to?: string }) => {
    const qs = new URLSearchParams();
    if (params?.year) qs.set('year', String(params.year));
    if (params?.from) qs.set('from', params.from);
    if (params?.to) qs.set('to', params.to);
    const query = qs.toString();
    return http<ContactHistoryResponse>(`/my-contacts/history${query ? `?${query}` : ''}`);
  },
  contactCallDial: (id: string) =>
    http<{ dialString: string; receiverMasked: string; emitterMasked: string }>(
      `/contacts/${id}/call-dial`,
      { method: 'POST', body: JSON.stringify({}) },
    ),
  telephonyConfig: () =>
    http<{
      callMode?: 'microsip' | 'webrtc';
      displayName?: string;
      wssUrl?: string;
      bridgeMode?: 'provider' | 'embedded' | 'custom';
      domain?: string;
      username?: string;
      authorizationPassword?: string;
      stunServers?: string[];
    }>('/telephony/webrtc-config'),
};
