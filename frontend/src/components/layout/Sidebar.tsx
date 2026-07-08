import { NavLink } from 'react-router-dom';
import { FundMobileNavLink, FundSidebarNavLink } from './FundNavLink';
import { NavIcon, type NavIconId } from './NavIcons';

const NAV: Array<{
  to: string;
  label: string;
  short: string;
  iconId: NavIconId;
  end?: boolean;
}> = [
  { to: '/app', label: 'Resumen', short: 'Inicio', iconId: 'dashboard', end: true },
  { to: '/app/acciones', label: 'Bolsa de Valores', short: 'Bolsa', iconId: 'stocks' },
  { to: '/app/commodities', label: 'Materias Primas', short: 'Materias', iconId: 'commodities' },
  { to: '/app/forex', label: 'Divisas (Forex)', short: 'Forex', iconId: 'forex' },
  { to: '/app/cripto', label: 'Criptomonedas', short: 'Cripto', iconId: 'crypto' },
];

const FUND_NAV = {
  label: 'Fondear Cuenta',
  short: 'Fondear',
} as const;

export function MobileClientNav() {
  return (
    <nav
      className="flex gap-1.5 overflow-x-auto border-b border-ink-600/60 bg-ink-900/50 px-2 py-2 lg:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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
          <NavIcon id={item.iconId} className="nav-icon--sm" />
          <span className="sm:hidden">{item.short}</span>
          <span className="hidden sm:inline">{item.label}</span>
        </NavLink>
      ))}
      <FundMobileNavLink label={FUND_NAV.label} short={FUND_NAV.short} />
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
            <NavIcon id={item.iconId} />
            {item.label}
          </NavLink>
        ))}

        <div className="fund-nav-link__divider" aria-hidden />

        <FundSidebarNavLink label={FUND_NAV.label} />
      </nav>
      <div className="mt-auto rounded-lg border border-brand-500/30 bg-brand-500/10 p-3 text-xs text-brand-100">
        Cuenta en <strong>MXN</strong>. Opera con respaldo y procesos conforme a la normativa
        mexicana.
      </div>
    </aside>
  );
}
