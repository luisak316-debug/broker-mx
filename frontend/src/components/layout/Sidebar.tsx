import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/app', label: 'Resumen', icon: '◧', end: true },
  { to: '/app/acciones', label: 'Bolsa de Valores', icon: '📈' },
  { to: '/app/commodities', label: 'Materias Primas', icon: '🛢️' },
  { to: '/app/forex', label: 'Divisas (Forex)', icon: '💱' },
  { to: '/app/cripto', label: 'Criptomonedas', icon: '₿' },
  { to: '/app/fondear', label: 'Fondear Cuenta', icon: '💰' },
];

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-600/60 bg-ink-900/80 p-4 lg:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 font-bold text-white">
          B
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Broker MX</p>
          <p className="text-xs text-slate-400">Entorno de simulación</p>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <span className="text-base">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-200">
        Operas con saldo <strong>simulado</strong> en MXN. Ninguna operación es real.
      </div>
    </aside>
  );
}
