import type { ElementType, ReactNode } from 'react';

type Props = {
  as?: ElementType;
  variant?: 'sm' | 'md' | 'lg';
  className?: string;
  children: ReactNode;
};

const DIAMOND_COUNT = 8;

/** Texto blanco con halo dorado suave y micro-diamantes brillantes */
export function GoldenHighlight({
  as: Tag = 'span',
  variant = 'md',
  className = '',
  children,
}: Props) {
  return (
    <Tag
      className={`landing-gold-highlight landing-gold-highlight--${variant} ${className}`.trim()}
    >
      <span className="landing-gold-highlight__wrap">
        <span className="landing-gold-highlight__diamonds" aria-hidden>
          {Array.from({ length: DIAMOND_COUNT }, (_, i) => (
            <span key={i} className="landing-gold-highlight__diamond" />
          ))}
        </span>
        <span className="landing-gold-highlight__text">{children}</span>
      </span>
    </Tag>
  );
}
