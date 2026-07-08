import { type MouseEvent, type ReactNode } from 'react';
import { Link, useNavigate, type LinkProps } from 'react-router-dom';
import { confettiFromElement } from '../../lib/celebrationConfetti';

type Props = LinkProps & {
  children: ReactNode;
  className?: string;
  /** Retraso antes de navegar para que se vea el confeti */
  navigateDelayMs?: number;
};

export function CelebrationLink({
  children,
  className,
  navigateDelayMs = 480,
  onClick,
  to,
  ...rest
}: Props) {
  const navigate = useNavigate();

  function handleClick(e: MouseEvent<HTMLAnchorElement>) {
    onClick?.(e);
    if (e.defaultPrevented) return;

    confettiFromElement(e.currentTarget, 'normal');

    if (navigateDelayMs > 0) {
      e.preventDefault();
      window.setTimeout(() => {
        navigate(typeof to === 'string' ? to : to);
      }, navigateDelayMs);
    }
  }

  return (
    <Link to={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </Link>
  );
}
