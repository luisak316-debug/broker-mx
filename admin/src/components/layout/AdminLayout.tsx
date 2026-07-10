import { Navigate, Outlet } from 'react-router-dom';
import { MobileAdminNav, Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuth } from '../../auth/AuthContext';
import { PortalAtmosphere } from '../portal/PortalAtmosphere';

export function AdminLayout() {
  const { staff, loading } = useAuth();

  if (loading) {
    return (
      <div className="portal-page grid min-h-screen place-items-center text-emerald-200/60">
        <PortalAtmosphere />
        <span className="portal-shell">Cargando…</span>
      </div>
    );
  }
  if (!staff) return <Navigate to="/login" replace />;

  return (
    <div className="portal-page flex min-h-screen">
      <PortalAtmosphere />
      <div className="portal-shell flex min-h-screen min-w-0 flex-1">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar />
          <MobileAdminNav />
          <main className="flex-1 overflow-x-hidden px-4 py-6">
            <div className="mx-auto max-w-7xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
