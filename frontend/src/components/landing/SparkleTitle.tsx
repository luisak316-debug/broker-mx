import type { ElementType, ReactNode } from 'react';

type Props = {
  as?: ElementType;
  variant?: 'hero' | 'section';
  className?: string;
  children: ReactNode;
};

const SPARK_COUNT = 8;

export function SparkleTitle({
  as: Tag = 'h2',
  variant = 'section',
  className = '',
  children,
}: Props) {
  return (
    <Tag
      className={`landing-sparkle-title landing-sparkle-title--${variant} ${className}`.trim()}
    >
      <span className="landing-sparkle-title__inner">
        <span className="landing-sparkle-title__glitter" aria-hidden>
          {Array.from({ length: SPARK_COUNT }, (_, i) => (
            <span key={i} className="landing-sparkle-title__spark" />
          ))}
        </span>
        <span className="landing-sparkle-title__text">{children}</span>
      </span>
    </Tag>
  );
}
