import { NavLink } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import type { StaffRole } from '../../types';

const NAV: Array<{ to: string; label: string; icon: string; roles?: StaffRole[]; end?: boolean }> = [
  { to: '/', label: 'Dashboard', icon: '▦', end: true },
  { to: '/clientes', label: 'Directorio de clientes', icon: '👤' },
  { to: '/transacciones', label: 'Transacciones', icon: '↹' },
  { to: '/solicitudes', label: 'Solicitudes de efectivo', icon: '💵' },
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
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-600/60 bg-ink-900/80 p-4 md:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 font-bold text-white">
          A
        </span>
        <div>
          <p className="text-sm font-semibold text-white">admin</p>
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
    <nav className="flex gap-1 overflow-x-auto border-b border-ink-600/60 bg-ink-900/50 px-2 py-2 md:hidden">
      {NAV.filter((item) => !item.roles || can(...item.roles)).map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs ${
              isActive ? 'bg-brand-600/30 text-brand-100' : 'text-slate-400'
            }`
          }
        >
          {item.label}
        </NavLink>
      ))}
    </nav>
  );
}
