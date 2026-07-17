import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { PortalAtmosphere } from '../portal/PortalAtmosphere';
import { BRAND_NAME } from '../../data/brand';

const NAV = [
  { to: '/', label: 'Resumen', end: true },
  { to: '/clientes', label: 'Clientes' },
  { to: '/solicitudes', label: 'Solicitudes de efectivo' },
  { to: '/asesores', label: 'Asesores' },
  { to: '/asignar', label: 'Asignar contactos' },
  { to: '/historial', label: 'Historial' },
] as const;

export function SupervisorLayout() {
  const { staff, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="portal-page flex min-h-screen">
      <PortalAtmosphere />
      <div className="portal-shell flex min-h-screen min-w-0 flex-1">
        <aside className="portal-sidebar portal-panel">
          <div className="mb-8">
            <div className="portal-brand-mark flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 font-bold text-white">
              I
            </div>
            <p className="portal-title mt-3 font-semibold">{BRAND_NAME}</p>
            <p className="text-xs text-slate-500">Supervisores</p>
          </div>
          <nav className="space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <header className="portal-header portal-glass-header">
            <div className="lg:hidden">
              <p className="portal-title text-sm font-semibold">{BRAND_NAME}</p>
              <p className="text-xs text-slate-500">Supervisores</p>
            </div>
            <p className="hidden text-sm text-slate-400 lg:block">
              {staff?.displayName} · {staff?.email}
            </p>
            <button
              type="button"
              className="btn-ghost text-xs"
              onClick={() => {
                logout();
                navigate('/login');
              }}
            >
              Cerrar sesión
            </button>
          </header>

          <nav className="portal-mobile-nav portal-panel">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  `portal-mobile-nav-link ${isActive ? 'portal-mobile-nav-link-active' : 'portal-mobile-nav-link-idle'}`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <main className="flex-1 overflow-x-hidden px-3 py-6 sm:px-4">
            <div className="mx-auto max-w-6xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
