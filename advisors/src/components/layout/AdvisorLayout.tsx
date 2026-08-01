import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { CallProvider } from '../../call/CallContext';
import { CallWidget } from '../../call/CallWidget';
import { PortalAtmosphere } from '../portal/PortalAtmosphere';
import { BrandMark } from '../brand/BrandMark';
import { BRAND_NAME } from '../../data/brand';

const NAV = [
  { to: '/', label: 'Resumen', end: true as const },
  { to: '/contactos', label: 'Mis contactos', icon: '📞', end: true as const },
  { to: '/contactos/historial', label: 'Historial', icon: '📋' },
] as const;

export function AdvisorLayout() {
  const { staff, logout } = useAuth();
  const navigate = useNavigate();
  const teamLabel = staff?.managerTeamName ?? (staff?.managerTeam ? `Gerencia ${staff.managerTeam}` : 'Asesor');

  return (
    <CallProvider>
      <div className="portal-page flex min-h-screen">
        <PortalAtmosphere />
        <CallWidget />
        <div className="portal-shell flex min-h-screen min-w-0 flex-1">
        <aside className="portal-sidebar portal-panel">
          <div className="mb-8 flex items-center gap-2.5">
            <BrandMark size="md" />
            <div className="min-w-0">
              <p className="portal-title font-semibold leading-tight">{BRAND_NAME}</p>
              <p className="text-xs text-slate-500">Portal de asesores</p>
            </div>
          </div>
          <nav className="space-y-1">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
              >
                {'icon' in item && item.icon ? <span>{item.icon}</span> : null}
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col overflow-x-hidden">
          <header className="portal-header portal-glass-header">
            <div className="flex items-center gap-2 lg:hidden">
              <BrandMark size="sm" />
              <div>
                <p className="portal-title text-sm font-semibold">{BRAND_NAME}</p>
                <p className="text-xs text-slate-500">{teamLabel}</p>
              </div>
            </div>
            <p className="hidden text-sm text-slate-400 lg:block">
              {staff?.displayName} · {teamLabel}
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
            <div className="mx-auto max-w-5xl">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      </div>
    </CallProvider>
  );
}
