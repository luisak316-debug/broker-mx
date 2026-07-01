import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { api } from '../api/client';
import type { ClientSession } from '../types';

const TOKEN_KEY = 'brokermx_client_token';
const CLIENT_KEY = 'brokermx_client';

interface ClientAuthState {
  client: ClientSession | null;
  isAuthenticated: boolean;
  register: (p: { fullName: string; phone: string; otpCode: string; password: string }) => Promise<void>;
  login: (p: { phone: string; password: string }) => Promise<void>;
  logout: () => void;
  updateProfilePhoto: (url: string) => void;
}

const Ctx = createContext<ClientAuthState | null>(null);

function readStored(): ClientSession | null {
  try {
    const raw = localStorage.getItem(CLIENT_KEY);
    return raw ? (JSON.parse(raw) as ClientSession) : null;
  } catch {
    return null;
  }
}

export function ClientAuthProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<ClientSession | null>(readStored);

  function persist(token: string, c: ClientSession) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(CLIENT_KEY, JSON.stringify(c));
    setClient(c);
  }

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
    }),
    [client],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useClientAuth(): ClientAuthState {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useClientAuth debe usarse dentro de <ClientAuthProvider>');
  return ctx;
}
