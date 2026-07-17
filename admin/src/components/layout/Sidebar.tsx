import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { BRAND_NAME } from '../../data/brand';
import type { StaffRole } from '../../types';

const NAV: Array<{ to: string; label: string; icon: string; roles?: StaffRole[]; end?: boolean }> = [
  { to: '/', label: 'Dashboard', icon: '▦', end: true },
  { to: '/clientes', label: 'Directorio de clientes', icon: '👤' },
  { to: '/transacciones', label: 'Transacciones', icon: '↹' },
  { to: '/auditoria', label: 'Bitácora de auditoría', icon: '🛡', roles: ['COMPLIANCE'] },
];

function NavItems() {
  const { can } = useAuth();
  return (
    <>
      {NAV.filter((item) => !item.roles || can(...item.roles)).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `nav-link ${isActive ? 'nav-link-active' : ''}`}
        >
          <span className="text-base">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </>
  );
}

export function Sidebar() {
  return (
    <aside className="portal-sidebar portal-panel">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="portal-brand-mark grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-zinc-700 to-zinc-900 font-bold text-white">
          I
        </span>
        <div>
          <p className="text-sm font-semibold text-white">{BRAND_NAME}</p>
          <p className="text-xs text-slate-500">Panel de administración</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        <NavItems />
      </nav>
    </aside>
  );
}

export function MobileAdminNav() {
  const { can } = useAuth();
  return (
    <nav className="portal-mobile-nav portal-panel">
      {NAV.filter((item) => !item.roles || can(...item.roles)).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `portal-mobile-nav-link ${isActive ? 'portal-mobile-nav-link-active' : 'portal-mobile-nav-link-idle'}`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
