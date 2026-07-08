import { type MouseEvent, type ReactNode } from 'react';
import { NavLink, useNavigate, type NavLinkProps } from 'react-router-dom';
import { fireFundCelebration } from '../../lib/fundCelebrationEffect';
import { clearInvestmentScroll } from '../../lib/investmentScroll';
import { NavIcon, type NavIconId } from './NavIcons';

const FUND_TO = '/app/fondear';

type FundVisualProps = {
  iconId: NavIconId;
  label: ReactNode;
  short?: ReactNode;
};

function FundNavVisual({ iconId, label, short }: FundVisualProps) {
  return (
    <>
      <span className="fund-nav-link__frame" aria-hidden />
      <span className="fund-nav-link__glow" aria-hidden />
      <span className="fund-nav-link__shimmer" aria-hidden />
      <span className="fund-nav-link__fleck fund-nav-link__fleck--1" aria-hidden />
      <span className="fund-nav-link__fleck fund-nav-link__fleck--2" aria-hidden />
      <span className="fund-nav-link__fleck fund-nav-link__fleck--3" aria-hidden />
      <span className="fund-nav-link__content">
        <span className="fund-nav-link__icon" aria-hidden>
          <NavIcon id={iconId} />
        </span>
        {short != null ? (
          <>
            <span className="fund-nav-link__label fund-nav-link__label--short">{short}</span>
            <span className="fund-nav-link__label fund-nav-link__label--full">{label}</span>
          </>
        ) : (
          <span className="fund-nav-link__label">{label}</span>
        )}
      </span>
    </>
  );
}

function handleFundEntry(navigate: ReturnType<typeof useNavigate>) {
  clearInvestmentScroll();
  navigate(FUND_TO);
  window.requestAnimationFrame(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    window.history.replaceState(null, '', FUND_TO);
  });
}

function handleFundClick(e: MouseEvent<HTMLElement>, navigate: ReturnType<typeof useNavigate>) {
  e.preventDefault();
  fireFundCelebration(e.currentTarget);
  handleFundEntry(navigate);
}

type SidebarProps = {
  label: string;
};

export function FundSidebarNavLink({ label }: SidebarProps) {
  const navigate = useNavigate();

  return (
    <NavLink
      to={FUND_TO}
      onClick={(e) => handleFundClick(e, navigate)}
      className={({ isActive }) =>
        `fund-nav-link fund-nav-link--sidebar${isActive ? ' fund-nav-link--active' : ''}`
      }
    >
      <FundNavVisual iconId="fund" label={label} />
    </NavLink>
  );
}

type MobileProps = SidebarProps & {
  short: string;
};

export function FundMobileNavLink({ label, short }: MobileProps) {
  const navigate = useNavigate();

  return (
    <NavLink
      to={FUND_TO}
      onClick={(e) => handleFundClick(e, navigate)}
      className={({ isActive }) =>
        `fund-nav-link fund-nav-link--mobile${isActive ? ' fund-nav-link--active' : ''}`
      }
    >
      <FundNavVisual iconId="fund" label={label} short={short} />
    </NavLink>
  );
}

type CtaProps = Omit<NavLinkProps, 'to' | 'children'> & {
  children: ReactNode;
};

export function FundCtaLink({ children, className = '', onClick, ...rest }: CtaProps) {
  const navigate = useNavigate();

  return (
    <NavLink
      to={FUND_TO}
      className={`fund-nav-link fund-nav-link--cta ${className}`.trim()}
      onClick={(e) => {
        onClick?.(e);
        if (!e.defaultPrevented) handleFundClick(e, navigate);
      }}
      {...rest}
    >
      <FundNavVisual iconId="fund" label={children} />
    </NavLink>
  );
}

type ActionButtonProps = {
  children: ReactNode;
  className?: string;
  onClick: () => void;
};

/** Botón de acción (p. ej. «Ver mi panel de inversión») con el mismo efecto premium. */
export function FundCelebrationButton({ children, className = '', onClick }: ActionButtonProps) {
  return (
    <button
      type="button"
      className={`fund-nav-link fund-nav-link--action ${className}`.trim()}
      onClick={(e) => {
        fireFundCelebration(e.currentTarget);
        onClick();
      }}
    >
      <FundNavVisual iconId="investment" label={children} />
    </button>
  );
}
