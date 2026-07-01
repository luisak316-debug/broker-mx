import { NavLink } from 'react-router-dom';

const NAV = [
  { to: '/app', label: 'Resumen', short: 'Inicio', icon: '◧', end: true },
  { to: '/app/acciones', label: 'Bolsa de Valores', short: 'Bolsa', icon: '📈' },
  { to: '/app/commodities', label: 'Materias Primas', short: 'Materias', icon: '🛢️' },
  { to: '/app/forex', label: 'Divisas (Forex)', short: 'Forex', icon: '💱' },
  { to: '/app/cripto', label: 'Criptomonedas', short: 'Cripto', icon: '₿' },
  { to: '/app/fondear', label: 'Fondear Cuenta', short: 'Fondear', icon: '💰' },
];

export function MobileClientNav() {
  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-ink-600/60 bg-ink-900/50 px-2 py-2 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Navegación principal"
    >
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) =>
            `inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-lg px-2.5 py-1.5 text-xs font-medium sm:px-3 ${
              isActive ? 'bg-brand-600/30 text-brand-100' : 'text-slate-400 hover:text-slate-200'
            }`
          }
        >
          <span aria-hidden>{item.icon}</span>
          <span className="sm:hidden">{item.short}</span>
          <span className="hidden sm:inline">{item.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-ink-600/60 bg-ink-900/80 p-4 lg:flex">
      <div className="mb-6 flex items-center gap-2 px-2">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-500 font-bold text-white">
          B
        </span>
        <div>
          <p className="text-sm font-semibold text-white">Broker.mx</p>
          <p className="text-xs text-slate-400">Intermediación financiera</p>
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
      <div className="mt-auto rounded-lg border border-brand-500/30 bg-brand-500/10 p-3 text-xs text-brand-100">
        Cuenta en <strong>MXN</strong>. Opera con respaldo y procesos conforme a la normativa
        mexicana.
      </div>
    </aside>
  );
}
