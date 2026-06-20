import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Footer } from './Footer';
import { useLivePrices } from '../../hooks/useLivePrices';

export function AppLayout() {
  const { connected } = useLivePrices();
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar connected={connected} />
        <main className="flex-1 overflow-x-hidden px-4 py-6">
          <div className="mx-auto max-w-7xl">
            <Outlet />
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
