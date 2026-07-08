import type { ReactNode } from 'react';
import { SparkleTitle } from './SparkleTitle';

type Props = {
  eyebrow?: string;
  title?: string;
  description?: ReactNode;
  meta?: string;
  className?: string;
  sparkleTitle?: boolean;
  sparkleEyebrow?: boolean;
  variant?: 'default' | 'capital';
};

export function LandingSectionHeader({
  eyebrow,
  title,
  description,
  meta,
  className = '',
  sparkleTitle = false,
  sparkleEyebrow = false,
  variant = 'default',
}: Props) {
  if (variant === 'capital') {
    return (
      <div className={`cap-section__inner cap-section__inner--header ${className}`.trim()}>
        {eyebrow ? <p className="cap-eyebrow">{eyebrow}</p> : null}
        {title ? <h2 className="cap-display">{title}</h2> : null}
        {description ? <div className="cap-lead">{description}</div> : null}
        {meta ? <p className="cap-meta">{meta}</p> : null}
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-3xl px-4 text-center ${className}`}>
      {eyebrow ? (
        sparkleEyebrow ? (
          <SparkleTitle
            as="p"
            variant="section"
            className="text-2xl font-bold sm:text-3xl"
          >
            {eyebrow}
          </SparkleTitle>
        ) : (
          <p className="text-sm font-semibold uppercase tracking-wide text-brand-300">{eyebrow}</p>
        )
      ) : null}
      {title ? (
        sparkleTitle ? (
          <SparkleTitle
            className={`text-2xl font-bold sm:text-3xl ${eyebrow && !sparkleEyebrow ? 'mt-2' : sparkleEyebrow ? 'mt-3' : ''}`}
          >
            {title}
          </SparkleTitle>
        ) : (
          <h2
            className={`text-2xl font-bold text-white sm:text-3xl ${eyebrow ? 'mt-2' : ''}`}
          >
            {title}
          </h2>
        )
      ) : null}
      {description ? (
        <p className="mt-3 text-base leading-relaxed text-slate-300 sm:text-lg">{description}</p>
      ) : null}
      {meta ? <p className="mt-3 text-xs text-slate-500">{meta}</p> : null}
    </div>
  );
}
