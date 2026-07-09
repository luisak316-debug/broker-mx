import type { MouseEvent, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { celebrationFromElement } from '../../utils/celebrationBurst';

type BaseProps = {
  children: ReactNode;
  celebrate?: boolean;
  className?: string;
};

type AnchorProps = BaseProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as?: 'a';
  };

type RouterLinkProps = BaseProps &
  LinkProps & {
    as: 'link';
  };

type Props = AnchorProps | RouterLinkProps;

function runCelebrate(
  e: MouseEvent<HTMLElement>,
  celebrate: boolean,
  handler?: (e: MouseEvent<HTMLElement>) => void,
) {
  if (celebrate) celebrationFromElement(e.currentTarget);
  handler?.(e);
}

export function CelebrationLink(props: Props) {
  const celebrate = props.celebrate !== false;

  if (props.as === 'link') {
    const { as: _as, celebrate: _c, children, className, onClick, ...rest } = props;
    return (
      <Link
        {...rest}
        className={className}
        onClick={(e) => runCelebrate(e, celebrate, onClick as ((ev: MouseEvent<HTMLElement>) => void) | undefined)}
      >
        {children}
      </Link>
    );
  }

  const { as: _as, celebrate: _c, children, className, onClick, ...rest } = props as AnchorProps;
  return (
    <a
      {...rest}
      className={className}
      onClick={(e) => runCelebrate(e, celebrate, onClick as ((ev: MouseEvent<HTMLElement>) => void) | undefined)}
    >
      {children}
    </a>
  );
}
