import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import { prefetchDepositAccount } from '../lib/depositAccountCache';
import type { ClientSession } from '../types';

const TOKEN_KEY = 'brokermx_client_token';
const CLIENT_KEY = 'brokermx_client';

interface ClientAuthState {
  client: ClientSession | null;
  isAuthenticated: boolean;
  register: (p: {
    fullName: string;
    countryCode: string;
    phone: string;
    otpCode: string;
    password: string;
  }) => Promise<void>;
  login: (p: { countryCode: string; phone: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfilePhoto: (url: string) => void;
  refreshSession: () => Promise<void>;
}

const Ctx = createContext<ClientAuthState | null>(null);

function readStored(): ClientSession | null {
  try {
    const raw = localStorage.getItem(CLIENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ClientSession;
    return {
      ...parsed,
      countryCode: parsed.countryCode ?? 'MX',
      currency: parsed.currency ?? 'MXN',
    };
  } catch {
    return null;
  }
}

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ClientSession | null>(readStored);

  const applyClient = useCallback((c: ClientSession) => {
    localStorage.setItem(CLIENT_KEY, JSON.stringify(c));
    setClient(c);
  }, []);

  function persist(token: string, c: ClientSession) {
    localStorage.setItem(TOKEN_KEY, token);
    applyClient(c);
    void prefetchDepositAccount(c.id, api.depositAccount).catch(() => undefined);
  }

  const refreshSession = useCallback(async () => {
    const stored = readStored();
    if (!stored?.id) return;
    try {
      const fresh = await api.refreshSession(stored.id);
      applyClient({ ...stored, ...fresh });
    } catch {
      /* sesión local sigue válida si la API no responde */
    }
  }, [applyClient]);

  useEffect(() => {
    void refreshSession();
    const stored = readStored();
    if (stored?.id) {
      void prefetchDepositAccount(stored.id, api.depositAccount).catch(() => undefined);
    }
    const onFocus = () => void refreshSession();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [refreshSession]);

  const value = useMemo<ClientAuthState>(
    () => ({
      client,
      isAuthenticated: !!client,
      register: async (p) => {
        const res = await api.register(p);
        persist(res.token, res.client);
      },
      login: async (p) => {
        const res = await api.login(p);
        persist(res.token, res.client);
      },
      logout: () => {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(CLIENT_KEY);
        setClient(null);
      },
      updateProfilePhoto: (url: string) => {
        setClient((prev) => {
          if (!prev) return prev;
          const next = { ...prev, profilePhotoUrl: url };
          localStorage.setItem(CLIENT_KEY, JSON.stringify(next));
          return next;
        });
      },
      refreshSession,
    }),
    [client, refreshSession],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useClientAuth(): ClientAuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useClientAuth debe usarse dentro de <ClientAuthProvider>');
  return ctx;
}
