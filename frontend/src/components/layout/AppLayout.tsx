import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { api } from '../../api/client';
import { useClientAuth } from '../../auth/ClientAuthContext';
import { prefetchDepositAccount } from '../../lib/depositAccountCache';
import { MobileClientNav, Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';
import { useLivePrices } from '../../hooks/useLivePrices';

export function AppLayout() {
  const { connected } = useLivePrices();
  const { client } = useClientAuth();

  useEffect(() => {
    if (!client?.id) return;
    void prefetchDepositAccount(client.id, api.depositAccount).catch(() => undefined);
  }, [client?.id]);

  return (
    <div className="flex min-h-[100dvh] w-full max-w-[100dvw] overflow-x-hidden">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
        <Topbar connected={connected} />
        <MobileClientNav />
        <main className="flex-1 overflow-x-hidden px-3 py-4 sm:px-4 sm:py-6">
          <div className="mx-auto w-full min-w-0 max-w-7xl">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
