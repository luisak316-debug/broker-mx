import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { api, tokenStore } from '../api/client';
import type { StaffSession } from '../types';

interface AuthState {
  staff: StaffSession | null;
  loading: boolean;
  login: (access: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthCtx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [staff, setStaff] = useState<StaffSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tokenStore.get()) {
      setLoading(false);
      return;
    }
    api
      .me()
      .then(setStaff)
      .catch(() => {
        tokenStore.clear();
        setStaff(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      staff,
      loading,
      login: async (access, password) => {
        const { token, staff: s } = await api.login(access, password);
        tokenStore.set(token);
        setStaff(s);
      },
      logout: () => {
        tokenStore.clear();
        setStaff(null);
      },
    }),
    [staff, loading],
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
