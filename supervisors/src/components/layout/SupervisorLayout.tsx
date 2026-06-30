import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';

const NAV = [
  { to: '/', label: 'Resumen', end: true },
  { to: '/clientes', label: 'Clientes' },
  { to: '/asesores', label: 'Asesores' },
  { to: '/asignar', label: 'Asignar contactos' },
  { to: '/historial', label: 'Historial' },
] as const;

export function SupervisorLayout() {
  const { staff, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-ink-600 bg-ink-900/80 p-4 lg:block">
        <div className="mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500 font-bold text-white">
            S
          </div>
          <p className="mt-3 font-semibold text-white">Supervisores</p>
          <p className="text-xs text-slate-400">Broker.mx</p>
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

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-ink-600 bg-ink-900/50 px-4 py-3">
          <div className="lg:hidden">
            <p className="font-semibold text-white">Supervisores</p>
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

        <nav className="flex gap-1 overflow-x-auto border-b border-ink-600 px-2 py-2 lg:hidden">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                `whitespace-nowrap rounded-lg px-3 py-1.5 text-xs ${isActive ? 'bg-brand-600/30 text-brand-100' : 'text-slate-400'}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
