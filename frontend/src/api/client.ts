import type {
  AuthResult,
  Candle,
  CommodityAlert,
  DepositAccountInfo,
  DividendRecord,
  Instrument,
  MarketNewsResponse,
  PortfolioSummary,
  Quote,
} from '../types';

import { getApiBase } from '../lib/apiConfig';

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${getApiBase()}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });
  if (res.status === 405) {
    throw new Error(
      'La API no esta conectada. Ejecuta CONFIGURAR_API_VERCEL.bat con la URL del backend.',
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
  instruments: (assetClass?: string, group?: string) => {
    const qs = new URLSearchParams();
    if (assetClass) qs.set('assetClass', assetClass);
    if (group) qs.set('group', group);
    return http<Instrument[]>(`/instruments?${qs.toString()}`);
  },
  quotes: (symbols?: string[]) =>
    http<Quote[]>(`/quotes${symbols?.length ? `?symbols=${symbols.join(',')}` : ''}`),
  quote: (symbol: string) => http<Quote>(`/quotes/${encodeURIComponent(symbol)}`),
  candles: (symbol: string, points = 120, step = 3600) =>
    http<Candle[]>(`/candles/${encodeURIComponent(symbol)}?points=${points}&step=${step}`),
  dividends: (symbol: string) =>
    http<DividendRecord[]>(`/stocks/${encodeURIComponent(symbol)}/dividends`),
  commodityAlerts: (threshold = 1.5) =>
    http<CommodityAlert[]>(`/commodities/alerts?threshold=${threshold}`),
  convert: (pair: string, amount: number, side: 'buy' | 'sell', spread?: number) => {
    const qs = new URLSearchParams({ pair, amount: String(amount), side });
    if (spread !== undefined) qs.set('spread', String(spread));
    return http<{
      pair: string;
      side: string;
      amount: number;
      rate: number;
      mid: number;
      bid: number;
      ask: number;
      spread: number;
      result: number;
      updatedAt: string;
    }>(`/forex/convert?${qs.toString()}`);
  },
  portfolio: (userId = 'demo-user') => http<PortfolioSummary>(`/portfolio/${userId}`),
  depositAccount: (clientId: string) =>
    http<DepositAccountInfo>(`/deposit-account/${encodeURIComponent(clientId)}`),

  marketNews: () => http<MarketNewsResponse>('/market-news'),

  sendOtp: (payload: { phone: string }) =>
    http<import('../types').SendOtpResult>(`/auth/send-otp`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  register: (payload: { fullName: string; phone: string; otpCode: string; password: string }) =>
    http<AuthResult>(`/auth/register`, { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { phone: string; password: string }) =>
    http<AuthResult>(`/auth/login`, { method: 'POST', body: JSON.stringify(payload) }),
  sendRecoveryOtp: (payload: { phone: string }) =>
    http<import('../types').SendOtpResult>(`/auth/recovery/send-otp`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  resetPassword: (payload: { phone: string; otpCode: string; password: string }) =>
    http<{ message: string }>(`/auth/recovery/reset-password`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  requestWithdrawal: (payload: {
    clientId: string;
    amountMxn: number;
    note?: string;
    payoutBank: string;
    payoutOwnerName: string;
  }) =>
    http<{ message: string; cashMxn: number }>(`/cash-requests/withdraw`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  placeOrder: (payload: {
    userId?: string;
    symbol: string;
    side: 'buy' | 'sell';
    direction: 'long' | 'short';
    quantity: number;
  }) => http(`/orders`, { method: 'POST', body: JSON.stringify(payload) }),
};
